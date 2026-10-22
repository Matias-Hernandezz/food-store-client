import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../shared/api/axiosClient";
import type { PublicSeguimiento } from "../api/publicApi";

export function usePublicSeguimientoWS(trackingToken: string | undefined, enabled = true) {
    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!enabled || !trackingToken) return;

        const wsUrl = `${API_BASE_URL.replace("http", "ws")}/api/v1/public/ws/seguimiento/${trackingToken}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data);
                if (data.event === "ping") return;
                if (data.event === "rider_location" && data.data?.lat != null && data.data?.lng != null) {
                    queryClient.setQueryData<PublicSeguimiento>(
                        ["seguimiento", trackingToken],
                        (old) =>
                            old
                                ? {
                                      ...old,
                                      rider: { lat: data.data.lat, lng: data.data.lng },
                                      rider_updated_at: data.data.rider_updated_at ?? new Date().toISOString(),
                                  }
                                : old,
                    );
                    return;
                }
                queryClient.invalidateQueries({ queryKey: ["seguimiento", trackingToken] });
            } catch {
                /* ignore */
            }
        };

        return () => {
            ws.onclose = null;
            ws.close(1000);
            wsRef.current = null;
        };
    }, [trackingToken, enabled, queryClient]);
}
