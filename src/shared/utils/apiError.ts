import type { AxiosError } from "axios";

export function getApiErrorDetail(err: unknown, fallback = "Ocurrió un error"): string {
    const ax = err as AxiosError<{ detail?: string }>;
    if (ax?.response?.data?.detail) return String(ax.response.data.detail);
    if (err instanceof Error && err.message) return err.message;
    return fallback;
}
