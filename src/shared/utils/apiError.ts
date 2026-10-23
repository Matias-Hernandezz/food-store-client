import axios, { type AxiosError } from "axios";

export type ApiProblemBody = {
    detail?: string | { msg?: string; loc?: (string | number)[] }[];
    title?: string;
    status?: number;
    errors?: { field?: string; message?: string; type?: string }[];
};

const NETWORK_PATTERNS = [
    "failed to fetch",
    "network error",
    "err_network",
    "load failed",
    "networkrequestfailed",
];

function isNetworkMessage(msg: string): boolean {
    const m = msg.toLowerCase();
    return NETWORK_PATTERNS.some((p) => m.includes(p));
}

function humanizeField(field?: string): string {
    if (!field) return "";
    const last = field.split("→").pop()?.trim() ?? field;
    const map: Record<string, string> = {
        body: "formulario",
        email: "email",
        password: "contraseña",
        nombre: "nombre",
        apellido: "apellido",
        linea1: "calle",
        ciudad: "ciudad",
        provincia: "provincia",
        codigo_postal: "código postal",
        forma_pago_codigo: "forma de pago",
        producto_id: "producto",
        cantidad: "cantidad",
    };
    return map[last] ?? last;
}

function humanizeValidationMessage(msg: string): string {
    const rules: [string, string][] = [
        ["Field required", "es obligatorio"],
        ["value is not a valid email address", "email inválido"],
        ["String should have at least", "es demasiado corto"],
        ["String should have at most", "es demasiado largo"],
        ["Input should be greater than or equal to", "debe ser mayor o igual a"],
    ];
    for (const [pattern, replacement] of rules) {
        if (msg.includes(pattern)) return replacement;
    }
    return msg;
}

export function extractApiDetail(data: unknown): string | null {
    if (!data || typeof data !== "object") return null;
    const body = data as ApiProblemBody;

    if (Array.isArray(body.errors) && body.errors.length > 0) {
        const parts = body.errors.map((e) => {
            const field = humanizeField(e.field);
            const msg = humanizeValidationMessage(e.message ?? "dato inválido");
            return field ? `${field}: ${msg}` : msg;
        });
        return parts.join(" · ");
    }

    const detail = body.detail;
    if (typeof detail === "string" && detail.trim()) return detail.trim();

    if (Array.isArray(detail) && detail.length > 0) {
        return detail
            .map((d) => {
                const loc = Array.isArray(d.loc) ? d.loc.filter((x) => x !== "body").join(".") : "";
                const field = humanizeField(loc);
                const msg = humanizeValidationMessage(d.msg ?? "dato inválido");
                return field ? `${field}: ${msg}` : msg;
            })
            .join(" · ");
    }

    return null;
}

function statusFallback(status: number): string | null {
    switch (status) {
        case 400:
            return "Revisá los datos del pedido";
        case 401:
            return "Tenés que iniciar sesión";
        case 403:
            return "El local no acepta pedidos en este momento";
        case 404:
            return "No encontramos lo que buscás";
        case 409:
            return "No se pudo completar el pedido";
        case 422:
            return "Revisá los datos del formulario";
        case 429:
            return "Demasiados intentos. Esperá un momento.";
        case 500:
            return "Error del servidor. Intentá de nuevo.";
        default:
            return status >= 500 ? "Error del servidor. Intentá más tarde" : null;
    }
}

export function messageFromHttpResponse(status: number, body: unknown, fallback: string): string {
    const fromBody = extractApiDetail(body);
    if (fromBody && !isNetworkMessage(fromBody)) return fromBody;
    return statusFallback(status) ?? fallback;
}

export function getApiErrorDetail(err: unknown, fallback = "Ocurrió un error"): string {
    return getApiErrorMessage(err, fallback);
}

export function getApiErrorMessage(err: unknown, fallback = "Ocurrió un error. Intentá de nuevo."): string {
    if (!navigator.onLine) {
        return "Sin conexión a internet. Revisá tu red.";
    }

    if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<ApiProblemBody>;
        if (!ax.response) {
            if (isNetworkMessage(ax.message ?? "")) {
                return "No pudimos conectar con la tienda. Verificá tu conexión o probá más tarde.";
            }
            return fallback;
        }
        return messageFromHttpResponse(ax.response.status, ax.response.data, fallback);
    }

    if (err instanceof Error) {
        if (isNetworkMessage(err.message)) {
            return "No pudimos conectar con la tienda. Verificá tu conexión o probá más tarde.";
        }
        if (err.message && err.message !== "Error" && !err.message.startsWith("HTTP ")) {
            return err.message;
        }
    }

    return fallback;
}
