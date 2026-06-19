import { create } from "zustand";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface WSState {
    status: ConnectionStatus;
    subscribedOrders: Set<number>;
    lastEvent: WSEvent | null;
    reconnectAttempt: number;

    // Actions
    setStatus: (status: ConnectionStatus) => void;
    subscribe: (pedidoId: number) => void;
    unsubscribe: (pedidoId: number) => void;
    setLastEvent: (event: WSEvent) => void;
    incrementReconnect: () => void;
    resetReconnect: () => void;
    reset: () => void;
}

export interface WSEvent {
    event: string;
    pedido_id: number;
    estado_anterior: string | null;
    estado_nuevo: string;
    usuario_id: number | null;
    motivo: string | null;
    timestamp: string;
    data?: Record<string, unknown>;
}

const initialState = {
    status: "disconnected" as ConnectionStatus,
    subscribedOrders: new Set<number>(),
    lastEvent: null as WSEvent | null,
    reconnectAttempt: 0,
};

export const useWSStore = create<WSState>()((set, get) => ({
    ...initialState,

    setStatus: (status) => set({ status }),

    subscribe: (pedidoId) =>
        set((s) => {
            const next = new Set(s.subscribedOrders);
            next.add(pedidoId);
            return { subscribedOrders: next };
        }),

    unsubscribe: (pedidoId) =>
        set((s) => {
            const next = new Set(s.subscribedOrders);
            next.delete(pedidoId);
            return { subscribedOrders: next };
        }),

    setLastEvent: (event) => set({ lastEvent: event }),

    incrementReconnect: () =>
        set((s) => ({ reconnectAttempt: s.reconnectAttempt + 1 })),

    resetReconnect: () => set({ reconnectAttempt: 0 }),

    reset: () => set({ ...initialState, subscribedOrders: new Set() }),
}));