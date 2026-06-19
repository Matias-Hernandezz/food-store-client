// src/features/pedidos/hooks/useOrderStatusWS.ts
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWSStore, type WSEvent } from "../store/wsStore";
import { API_BASE_URL } from "../../../shared/api/axiosClient";

const MAX_RETRIES = 10;
const BASE_DELAY = 1000; // 1 segundo

/**
 * Token fetcher — el hook la llama al iniciar la conexión.
 * Pasale una función que devuelva el JWT (ej: desde /api/v1/auth/token).
 */
type TokenGetter = () => Promise<string | null>;

/**
 * Hook que gestiona la conexión WebSocket para notificaciones de pedidos.
 *
 * Uso:
 *   useOrderStatusWS({
 *     pedidoIds: [123, 456],
 *     getToken: async () => {
 *       const res = await apiFetch<{ access_token: string }>("/api/v1/auth/token");
 *       return res.access_token;
 *     },
 *   });
 */
export function useOrderStatusWS({
    pedidoIds = [],
    getToken,
    enabled = true,
}: {
    pedidoIds?: number[];
    getToken: TokenGetter;
    enabled?: boolean;
}) {
    const queryClient = useQueryClient();
    const setStatus = useWSStore((s) => s.setStatus);
    const subscribe = useWSStore((s) => s.subscribe);
    const unsubscribe = useWSStore((s) => s.unsubscribe);
    const setLastEvent = useWSStore((s) => s.setLastEvent);
    const incrementReconnect = useWSStore((s) => s.incrementReconnect);
    const resetReconnect = useWSStore((s) => s.resetReconnect);

    const wsRef = useRef<WebSocket | null>(null);
    const retryRef = useRef(0);
    const mountedRef = useRef(true);
    const pedidoIdsRef = useRef(pedidoIds);
    pedidoIdsRef.current = pedidoIds;

    const connect = useCallback(async () => {
        if (!mountedRef.current || !enabled) return;

        // 1. Obtener token fresco
        let token: string | null = null;
        try {
            token = await getToken();
        } catch {
            setStatus("error");
            return;
        }

        if (!token || !mountedRef.current) return;

        // 2. Crear WebSocket
        setStatus("connecting");
        const wsUrl = `${API_BASE_URL.replace("http", "ws")}/api/v1/pedidos/ws/pedidos?token=${token}`;

        let ws: WebSocket;
        try {
            ws = new WebSocket(wsUrl);
            wsRef.current = ws;
        } catch {
            setStatus("error");
            scheduleReconnect();
            return;
        }

        // 3. onopen → suscribirse a los pedidos
        ws.onopen = () => {
            if (!mountedRef.current) return;
            setStatus("connected");
            resetReconnect();
            retryRef.current = 0;

            // Suscribirse a cada pedido actual
            for (const pid of pedidoIdsRef.current) {
                ws.send(JSON.stringify({ action: "subscribe-order", pedido_id: pid }));
                subscribe(pid);
            }

            // Invalidar queries para tener datos frescos
            queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
        };

        // 4. onmessage → procesar evento y refrescar queries
        ws.onmessage = (msg) => {
            if (!mountedRef.current) return;
            try {
                const event: WSEvent = JSON.parse(msg.data);

                if (event.event === "SUBSCRIBED") return;
                if (event.event === "ERROR") return;

                setLastEvent(event);

                // Invalidar queries para que React Query refresque los datos
                queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
                queryClient.invalidateQueries({
                    queryKey: ["pedido", event.pedido_id],
                });
            } catch {
                // mensaje no es JSON válido, ignorar
            }
        };

        // 5. onclose → reconectar si no fue cierre limpio
        ws.onclose = (ev) => {
            if (!mountedRef.current) return;

            // 4001 = token inválido/expirado → intentar refresh y reconectar
            if (ev.code === 4001) {
                getToken().then((newToken) => {
                    if (newToken && mountedRef.current) {
                        connect();
                    } else {
                        setStatus("error");
                    }
                }).catch(() => {
                    setStatus("error");
                });
                return;
            }

            // Cierre limpio (código 1000) → no reintentar
            if (ev.code === 1000) {
                setStatus("disconnected");
                return;
            }

            // Reconexión con backoff
            scheduleReconnect();
        };

        ws.onerror = () => {
            // onclose se dispara después de onerror, así que no hacemos nada acá
        };
    }, [enabled, getToken, queryClient, setStatus, subscribe, setLastEvent, incrementReconnect, resetReconnect]);

    // ─── Reconexión con backoff exponencial ──────────────────────────────

    const scheduleReconnect = useCallback(() => {
        if (!mountedRef.current) return;

        const attempt = retryRef.current + 1;
        if (attempt > MAX_RETRIES) {
            setStatus("error");
            return;
        }

        retryRef.current = attempt;
        incrementReconnect();

        const delay = Math.min(BASE_DELAY * 2 ** (attempt - 1), 30000);
        window.setTimeout(() => {
            if (mountedRef.current) connect();
        }, delay);
    }, [connect, setStatus, incrementReconnect]);

    // ─── Efecto principal ────────────────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;
        if (!enabled) return;

        connect();

        return () => {
            mountedRef.current = false;
            const ws = wsRef.current;
            if (ws) {
                ws.onclose = null; // evitar reconexión en cleanup
                ws.close(1000, "Component unmounted");
                wsRef.current = null;
            }
            setStatus("disconnected");
        };
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Re-suscribir cuando cambian los pedidoIds ───────────────────────

    useEffect(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // Suscribir nuevos pedidos
        for (const pid of pedidoIds) {
            ws.send(JSON.stringify({ action: "subscribe-order", pedido_id: pid }));
            subscribe(pid);
        }
    }, [pedidoIds, subscribe]);
}