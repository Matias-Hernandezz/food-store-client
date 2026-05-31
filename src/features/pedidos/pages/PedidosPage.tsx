import { useNavigate } from "react-router-dom";
import { useMisPedidos, ESTADO_LABEL, ESTADO_COLOR } from "../hooks/usePedidos";
import { toNumber } from "../../../shared/types";
import { useAuth } from "../../auth/context/AuthContext";

export function PedidosPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data, isLoading } = useMisPedidos();
    const pedidos = data?.data ?? [];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5ede6" }}>
                <div className="text-center px-6">
                    <p className="text-5xl mb-4">🔐</p>
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
            <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
                <h1 className="font-bold text-[#2d1e0f]">Mis Pedidos</h1>
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">📋</p>
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
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-[#2d1e0f]">Pedido #{p.id}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(p.created_at).toLocaleDateString("es-AR")}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[p.estado_codigo]}`}>
                                        {ESTADO_LABEL[p.estado_codigo]}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    {p.detalles.map((d) => (
                                        <p key={d.producto_id} className="text-sm text-gray-600">
                                            {d.cantidad}x {d.nombre_snapshot}
                                        </p>
                                    ))}
                                </div>
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