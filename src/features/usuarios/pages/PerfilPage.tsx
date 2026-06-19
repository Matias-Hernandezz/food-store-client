// src/features/usuarios/pages/PerfilPage.tsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { ReceiptIcon, UserIcon } from "../../../assets/icons/Icons";

export function PerfilPage() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
            <div className="bg-white px-5 py-4 shadow-sm">
                <h1 className="font-bold text-[#2d1e0f]">Mi Perfil</h1>
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto">
                {user ? (
                    <>
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-[#f5ede6] rounded-full flex items-center justify-center">
                                    <UserIcon width={28} height={28} style={{ color: "#c8722a" }} />
                                </div>
                                <div>
                                    <p className="font-bold text-[#2d1e0f]">{user.nombre} {user.apellido}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {user.roles.map((r) => (
                                    <span key={r} className="text-xs font-bold bg-[#f5ede6] text-[#c8722a] px-3 py-1 rounded-full">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/pedidos")}
                            className="w-full bg-white rounded-2xl p-4 shadow-sm text-left font-medium text-[#2d1e0f] flex items-center justify-between mb-3 hover:shadow-md transition-shadow"
                        >
                            <span className="flex items-center gap-2"><ReceiptIcon width={18} height={18} style={{ color: "#c8722a" }} /> Mis Pedidos</span>
                            <span className="text-gray-400">→</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-50 border border-red-100 text-red-600 font-bold py-4 rounded-2xl mt-4 hover:bg-red-100 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="flex justify-center mb-4">
                            <UserIcon width={48} height={48} style={{ color: "#c8722a", opacity: 0.4 }} />
                        </div>
                        <p className="text-gray-500 mb-6">No estás logueado</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}