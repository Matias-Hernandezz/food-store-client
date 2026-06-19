// src/features/pedidos/pages/PedidosPage.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMisPedidos, ESTADO_LABEL, ESTADO_COLOR } from "../hooks/usePedidos";
import { useIngredientes } from "../../catalogo/hooks/useCatalogo";
import { toNumber } from "../../../shared/types";
import { useAuthStore } from "../../../store/authStore";
import { useOrderStatusWS } from "../hooks/useOrderStatusWS";
import api from "../../../shared/api/axiosClient";
import { LockIcon, ClipboardIcon } from "../../../assets/icons/Icons";
import { OrderTimeline } from "../components/OrderTimeline";
import { ConnectionBadge } from "../components/ConnectionBadge";

export function PedidosPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { data, isLoading, refetch } = useMisPedidos();
    const pedidos = data?.data ?? [];
    const { data: ingredientesData } = useIngredientes();
    const ingredientesMap = useMemo(() => new Map(
        (ingredientesData?.data ?? []).map((i) => [i.id, i.nombre])
    ), [ingredientesData]);

    // WebSocket: se activa solo si hay usuario logueado
    useOrderStatusWS({
        pedidoIds: pedidos.map((p) => p.id),
        getToken: async () => {
            const res = await api.get<{ access_token: string }>("/api/v1/auth/token");
            return res.data.access_token;
        },
        enabled: !!user,
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5ede6" }}>
                <div className="text-center px-6">
                    <div className="mb-4 flex justify-center">
                        <LockIcon width={48} height={48} style={{ color: "#9a8070" }} />
                    </div>
                    <p className="text-gray-500 mb-6">Iniciá sesión para ver tus pedidos</p>
                    <button onClick={() => navigate("/login")}
                        className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl">
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
            {/* Header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
                    <h1 className="font-bold text-[#2d1e0f]">Mis Pedidos</h1>
                </div>
                <ConnectionBadge />
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-4 flex justify-center">
                        <ClipboardIcon width={48} height={48} style={{ color: "#9a8070" }} />
                    </div>
                        <p className="text-gray-500 mb-6">No tenés pedidos todavía</p>
                        <button onClick={() => navigate("/")}
                            className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl">
                            Ver menú
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm">
                                {/* Header de la card */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-[#2d1e0f]">Pedido #{p.id}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(p.created_at).toLocaleDateString("es-AR", {
                                                day: "numeric",
                                                month: "long",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[p.estado_codigo] || "bg-gray-100 text-gray-600"}`}>
                                        {ESTADO_LABEL[p.estado_codigo] || p.estado_codigo}
                                    </span>
                                </div>

                                {/* Timeline en vivo */}
                                <OrderTimeline estadoActual={p.estado_codigo} />

                                {/* Detalles del pedido */}
                                <div className="space-y-1 mb-3">
                                    {p.detalles?.map((d) => (
                                        <div key={d.producto_id}>
                                            <p className="text-sm text-gray-600">
                                                {d.cantidad}x {d.nombre_snapshot}
                                            </p>
                                            {Array.isArray(d.personalizacion) && d.personalizacion.length > 0 && (
                                                <p className="text-[11px] text-red-500 italic ml-1">
                                                    Sin: {ingredientesMap.size > 0
                                                        ? d.personalizacion.map((id) => ingredientesMap.get(Number(id)) ?? `#${id}`).join(", ")
                                                        : `${d.personalizacion.length} ingrediente(s)`}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between font-bold border-t border-gray-100 pt-3">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <span className="text-[#c8722a]">${toNumber(p.total).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}