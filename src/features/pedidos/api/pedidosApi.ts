import api from "../../../shared/api/axiosClient";
import type { PedidoCreate, Pedido, PedidoList, FormaPago, DireccionRead, DireccionCreate } from "../../../shared/types";
import type { PagoResponse } from "../../../store/paymentStore";

const BASE = "/api/v1/pedidos";

export const pedidosApi = {
    crear: (data: PedidoCreate) =>
        api.post<Pedido>(`${BASE}/`, data).then((r) => r.data),

    getMisPedidos: () =>
        api.get<PedidoList>(`${BASE}/?limit=50`).then((r) => r.data),

    getFormasPago: () =>
        api.get<FormaPago[]>(`${BASE}/formas-pago`).then((r) => r.data),

    getDirecciones: () =>
        api.get<DireccionRead[]>("/api/v1/direcciones").then((r) => r.data),

    crearDireccion: (data: DireccionCreate) =>
        api.post<DireccionRead>("/api/v1/direcciones", data).then((r) => r.data),

    deleteDireccion: (id: number) =>
        api.delete(`/api/v1/direcciones/${id}`),

    consultarPago: (pedidoId: number) =>
        api.get<PagoResponse>(`/api/v1/pagos/${pedidoId}`).then((r) => r.data),

    crearPago: (data: {
        pedido_id: number;
        token: string;
        payment_method_id: string;
        installments: number;
        issuer_id?: string;
        dni_number?: string;
    }) =>
        api.post<PagoResponse>("/api/v1/pagos/crear", data).then((r) => r.data),
};
