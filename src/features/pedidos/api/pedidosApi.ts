import { apiFetch } from "../../../shared/api/client";
import type { PedidoCreate, Pedido, PedidoList, FormaPago, DireccionRead, DireccionCreate } from "../../../shared/types";

export const pedidosApi = {
    crear: (data: PedidoCreate) =>
        apiFetch<Pedido>("/api/v1/pedidos/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getMisPedidos: () =>
        apiFetch<PedidoList>("/api/v1/pedidos/?limit=50"),

    getFormasPago: () =>
        apiFetch<FormaPago[]>("/api/v1/pedidos/formas-pago"),

    getDirecciones: () =>
        apiFetch<DireccionRead[]>("/api/v1/auth/direcciones"),

    crearDireccion: (data: DireccionCreate) =>
        apiFetch<DireccionRead>("/api/v1/auth/direccion", {
            method: "POST",
            body: JSON.stringify(data),
        }),

};