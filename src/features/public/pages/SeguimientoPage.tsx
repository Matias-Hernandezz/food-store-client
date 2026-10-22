import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/publicApi";
import { usePublicSeguimientoWS } from "../hooks/usePublicSeguimientoWS";
import { DeliveryMap } from "../components/DeliveryMap";
import { OrderTimeline } from "../../pedidos/components/OrderTimeline";
import { ESTADO_LABEL } from "../../pedidos/hooks/usePedidos";

export function SeguimientoPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["seguimiento", token],
        queryFn: () => publicApi.getSeguimiento(token!),
        enabled: !!token,
        refetchInterval: 30_000,
    });

    usePublicSeguimientoWS(token, !!token);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8D5C0" }}>
                <p className="text-[#2d1e0f]">Token de seguimiento inválido</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8D5C0" }}>
                <div className="w-8 h-8 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#E8D5C0" }}>
                <p className="text-[#2d1e0f] font-bold">No encontramos este pedido</p>
                <button onClick={() => navigate("/")} className="text-sm text-[#C87A2E] font-bold underline">
                    Volver al menú
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-10" style={{ backgroundColor: "#E8D5C0" }}>
            <div className="bg-[#F2E8D5] px-5 py-4 flex items-center gap-3 shadow-sm">
                <button type="button" onClick={() => navigate("/")} className="text-[#2d1e0f] text-xl">
                    ←
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-[#2d1e0f]">Seguimiento del pedido</h1>
                    <p className="text-xs text-[#9a8070]">Pedido #{data.pedido_id}</p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-xs font-bold text-[#C87A2E]"
                >
                    Actualizar
                </button>
            </div>

            <div className="max-w-lg mx-auto px-5 py-6 space-y-4">
                <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-[#9a8070] mb-1">Estado actual</p>
                    <p className="text-xl font-black text-[#2d1e0f]">
                        {ESTADO_LABEL[data.estado_codigo] ?? data.estado_codigo}
                    </p>
                    <p className="text-xs text-[#9a8070] mt-2">
                        {data.tipo_pedido === "PICKUP" ? "Retiro en el local" : "Envío a domicilio"}
                        {data.ciudad ? ` · ${data.ciudad}` : ""}
                    </p>
                </div>

                {data.seguimiento_mapa_activo && (data.destino || data.rider) && (
                    <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm space-y-3">
                        <h3 className="font-bold text-[#2d1e0f]">Recorrido del envío</h3>
                        <DeliveryMap
                            destino={data.destino}
                            rider={data.rider}
                        />
                        {data.destino_direccion && (
                            <p className="text-xs text-[#9a8070]">Destino: {data.destino_direccion}</p>
                        )}
                        {data.rider_updated_at && (
                            <p className="text-xs text-[#9a8070]">
                                Última ubicación del repartidor:{" "}
                                {new Date(data.rider_updated_at).toLocaleTimeString("es-AR")}
                            </p>
                        )}
                        {!data.rider && (
                            <p className="text-xs text-[#9a8070]">
                                Cuando el repartidor salga, vas a ver su posición acá en vivo.
                            </p>
                        )}
                    </div>
                )}

                <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                    <OrderTimeline estadoActual={data.estado_codigo} tipoPedido={data.tipo_pedido} />
                </div>

                <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm space-y-2">
                    <h3 className="font-bold text-[#2d1e0f] mb-2">Detalle</h3>
                    {data.detalles.map((d, i) => (
                        <div key={i} className="flex justify-between text-sm text-[#2d1e0f]">
                            <span>{d.cantidad}× {d.nombre_snapshot}</span>
                            <span className="font-medium">${Number(d.subtotal).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-[#3D2B1F]/20 pt-2 flex justify-between font-bold text-[#2d1e0f]">
                        <span>Total</span>
                        <span>${Number(data.total).toFixed(2)}</span>
                    </div>
                </div>

                <p className="text-center text-xs text-[#9a8070] px-4">
                    Guardá este link para seguir tu pedido sin iniciar sesión.
                </p>
            </div>
        </div>
    );
}
