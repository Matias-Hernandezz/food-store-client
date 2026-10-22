import api from "../../../shared/api/axiosClient";
import type { FormaPago } from "../../pedidos/types";
import type { Categoria, Producto } from "../../../shared/types";

const BASE = "/api/v1/public";

export interface PublicCatalogo {
    categorias: Categoria[];
    productos: PublicProducto[];
}

export interface PublicProducto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagenes_url: string[];
    disponible: boolean;
    categoria_ids: number[];
}

export function mapPublicProducto(p: PublicProducto): Producto {
    return {
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio_base: p.precio_base,
        imagenes_url: p.imagenes_url,
        disponible: p.disponible,
        stock_cantidad: p.disponible ? 999 : 0,
        categoria_ids: p.categoria_ids,
    };
}

export interface PublicClienteInput {
    nombre: string;
    apellido: string;
    email: string;
    celular?: string;
}

export interface PublicPedidoCreate {
    cliente: PublicClienteInput;
    items: { producto_id: number; cantidad: number; personalizacion?: number[] }[];
    forma_pago_codigo: string;
    tipo_pedido?: "DELIVERY" | "PICKUP" | "DINE_IN";
    direccion?: {
        alias?: string;
        linea1: string;
        linea2?: string;
        ciudad: string;
        provincia?: string;
        codigo_postal?: string;
        es_principal?: boolean;
    };
    notas?: string;
}

export interface PublicPedidoCreated {
    pedido_id: number;
    tracking_token: string;
    estado_codigo: string;
    tipo_pedido: string;
    total: number;
}

export interface PublicSeguimiento {
    pedido_id: number;
    estado_codigo: string;
    tipo_pedido: string;
    subtotal: number;
    costo_envio: number;
    total: number;
    created_at: string;
    updated_at: string;
    ciudad: string | null;
    detalles: {
        cantidad: number;
        nombre_snapshot: string;
        precio_snapshot: number;
        subtotal: number;
    }[];
}

export const publicApi = {
    getTienda: () => api.get<{ abierto: boolean; mensaje?: string }>(`${BASE}/tienda`).then((r) => r.data),

    getCatalogo: () => api.get<PublicCatalogo>(`${BASE}/catalogo`).then((r) => r.data),

    getFormasPago: () => api.get<FormaPago[]>(`${BASE}/formas-pago`).then((r) => r.data),

    crearPedido: (data: PublicPedidoCreate) =>
        api.post<PublicPedidoCreated>(`${BASE}/pedidos`, data).then((r) => r.data),

    getSeguimiento: (trackingToken: string) =>
        api.get<PublicSeguimiento>(`${BASE}/pedidos/seguimiento/${trackingToken}`).then((r) => r.data),

    getHistorial: (trackingToken: string) =>
        api
            .get<{ estado_desde: string | null; estado_hacia: string; created_at: string }[]>(
                `${BASE}/pedidos/seguimiento/${trackingToken}/historial`,
            )
            .then((r) => r.data),
};
