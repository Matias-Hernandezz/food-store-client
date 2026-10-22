import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/publicApi";

export function RepartidorPage() {
    const { riderToken } = useParams<{ riderToken: string }>();
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["rider-pedido", riderToken],
        queryFn: () => publicApi.getRiderPedido(riderToken!),
        enabled: !!riderToken,
        refetchInterval: 20_000,
    });

    const sendPosition = useCallback(
        async (lat: number, lng: number) => {
            if (!riderToken || !data?.puede_reportar) return;
            setSending(true);
            try {
                await publicApi.reportRiderLocation(riderToken, lat, lng);
                setError(null);
            } catch {
                setError("No se pudo enviar la ubicación");
            } finally {
                setSending(false);
            }
        },
        [riderToken, data?.puede_reportar],
    );

    useEffect(() => {
        if (!riderToken || !data?.puede_reportar) return;
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización");
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                sendPosition(pos.coords.latitude, pos.coords.longitude);
            },
            () => setError("Activá el permiso de ubicación para compartir el recorrido"),
            { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [riderToken, data?.puede_reportar, sendPosition]);

    if (!riderToken) {
        return <p className="p-6 text-center">Link de reparto inválido</p>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white p-6 text-center">
                Pedido no encontrado o link vencido
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-1">Modo repartidor</h1>
            <p className="text-sm text-gray-400 mb-6">Pedido #{data.pedido_id}</p>

            <div className="bg-[#2a2a2a] rounded-2xl p-5 space-y-3 mb-6">
                <p className="text-sm text-gray-300">
                    Estado: <span className="text-white font-semibold">{data.estado_codigo}</span>
                </p>
                {data.destino_direccion && (
                    <p className="text-sm">
                        <span className="text-gray-400">Entregar en:</span>
                        <br />
                        {data.destino_direccion}
                    </p>
                )}
            </div>

            {data.puede_reportar ? (
                <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-emerald-300">Ubicación activa</p>
                    <p className="text-emerald-100/80 mt-1">
                        {sending ? "Enviando posición…" : "El cliente ve tu recorrido en el mapa."}
                    </p>
                    <p className="text-xs text-emerald-200/60 mt-2">Dejá esta pantalla abierta durante el envío.</p>
                </div>
            ) : (
                <p className="text-amber-300 text-sm">Este pedido ya no está en reparto.</p>
            )}

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </div>
    );
}
