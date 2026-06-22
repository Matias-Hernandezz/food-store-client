// src/features/pedidos/store/paymentStore.ts
import { create } from "zustand";

export type PaymentFlow =
    | "idle"
    | "creating_pedido"
    | "awaiting_card"
    | "processing"
    | "approved"
    | "rejected"
    | "error";

export interface PagoResponse {
    id: number;
    pedido_id: number;
    mp_payment_id: number | null;
    mp_status: string;
    mp_status_detail: string | null;
    transaction_amount: number | string;
    payment_method_id: string | null;
    external_reference: string;
    created_at: string;
    updated_at: string;
}

interface PaymentState {
    flow: PaymentFlow;
    pedidoId: number | null;
    pedidoTotal: number;
    brickKey: number;
    pago: PagoResponse | null;
    intentos: number;
    errorMsg: string | null;

    setPedidoCreado: (pedidoId: number, total: number) => void;
    setProcessing: () => void;
    setApproved: (pago: PagoResponse) => void;
    setRejected: (pago: PagoResponse) => void;
    setError: (msg: string) => void;
    retry: () => void;
    reset: () => void;
}

const MAX_REINTENTOS = 3;

export const usePaymentStore = create<PaymentState>()((set, get) => ({
    flow: "idle",
    pedidoId: null,
    pedidoTotal: 0,
    brickKey: 0,
    pago: null,
    intentos: 0,
    errorMsg: null,

    setPedidoCreado: (pedidoId, total) =>
        set({ flow: "awaiting_card", pedidoId, pedidoTotal: total, intentos: 0, errorMsg: null }),

    setProcessing: () => set({ flow: "processing", errorMsg: null }),

    setApproved: (pago) => set({ flow: "approved", pago }),

    setRejected: (pago) => {
        const intentos = get().intentos + 1;
        set({ flow: "rejected", pago, intentos, errorMsg: pago.mp_status_detail || "Pago rechazado" });
    },

    setError: (msg) => set({ flow: "error", errorMsg: msg }),

    retry: () => {
        const { pedidoId } = get();
        if (pedidoId) {
            // ✅ Incrementar brickKey para forzar remount del Brick
            set((s) => ({ flow: "awaiting_card", pago: null, errorMsg: null, brickKey: s.brickKey + 1 }));
        } else {
            set({ flow: "idle", pedidoId: null, pago: null, intentos: 0, errorMsg: null });
        }
    },

    reset: () =>
        set({
            flow: "idle",
            pedidoId: null,
            pedidoTotal: 0,
            brickKey: 0,
            pago: null,
            intentos: 0,
            errorMsg: null,
        }),
}));