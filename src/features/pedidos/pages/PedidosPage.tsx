import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../shared/api/axiosClient";
import { usePedidos, ESTADO_LABEL, ESTADO_COLOR } from "../hooks/usePedidos";
import { toNumber } from "../../../shared/types";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { OrderTimeline } from "../components/OrderTimeline";
import { useAuthStore } from "../../../store/authStore";

interface IngredienteSimple { id: number; nombre: string }

export function PedidosPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { data, isLoading } = usePedidos({});
    const pedidos = data?.data ?? [];

    // Fetch ingredientes para resolver IDs en personalizacion
    const { data: ingredientesData } = useQuery({
        queryKey: ["ingredientes"],
        queryFn: () => api.get<{ data: IngredienteSimple[] }>("/api/v1/ingredientes/?limit=100").then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });
    const ingredientesMap = useMemo(() => new Map(
        (ingredientesData?.data ?? []).map((i) => [i.id, i.nombre])
    ), [ingredientesData]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8D5C0" }}>
                <div className="text-center px-6">
                    <p className="text-5xl mb-4">🔐</p>
                    <p className="text-[#9a8070] mb-6">Iniciá sesión para ver tus pedidos</p>
                    <button onClick={() => navigate("/login")}
                        className="bg-[#C87A2E] text-white font-bold px-6 py-3 rounded-xl">
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#E8D5C0" }}>
            <div className="bg-[#F2E8D5] px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate("/")} className="text-[#2d1e0f] text-xl">←</button>
                <h1 className="font-bold text-[#2d1e0f] flex-1">Mis Pedidos</h1>
                <ConnectionBadge />
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">📋</p>
                        <p className="text-[#9a8070] mb-6">No tenés pedidos todavía</p>
                        <button onClick={() => navigate("/")}
                            className="bg-[#C87A2E] text-white font-bold px-6 py-3 rounded-xl">
                            Ver menú
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((p) => (
                            <div key={p.id} className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-[#2d1e0f]">Pedido #{p.id}</p>
                                        <p className="text-xs text-[#9a8070]">
                                            {new Date(p.created_at).toLocaleDateString("es-AR")}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[p.estado_codigo]}`}>
                                        {ESTADO_LABEL[p.estado_codigo]}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    {p.detalles.map((d) => (
                                        <div key={d.id ?? d.producto_id}>
                                            <p className="text-sm text-[#2d1e0f]">
                                                {d.cantidad}x {d.nombre_snapshot}
                                            </p>
                                            {Array.isArray(d.personalizacion) && d.personalizacion.length > 0 && (
                                                <p className="text-[10px] text-red-500 italic ml-1">
                                                    Sin: {ingredientesMap.size > 0
                                                        ? d.personalizacion.map((id: number) => ingredientesMap.get(id) ?? `#${id}`).join(", ")
                                                        : `${d.personalizacion.length} ingrediente(s)`}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <OrderTimeline estadoActual={p.estado_codigo} />
                                <div className="flex justify-between font-bold border-t border-gray-200 pt-3">
                                    <span className="text-sm text-[#2d1e0f]">Total</span>
                                    <span className="text-[#2d1e0f]">${toNumber(p.total).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}