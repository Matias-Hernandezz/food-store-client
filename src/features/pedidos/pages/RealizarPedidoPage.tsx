import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../carrito/store/carritoStore";
import { useFormasPago, useCrearPedido, useDirecciones, useCrearDireccion } from "../hooks/usePedidos";
import { useAuth } from "../../auth/context/AuthContext";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || "TEST-xxxxxxxxxxxxxxxxxxxx";

export function RealizarPedidoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, total, limpiar } = useCarrito();

    // Hooks de la API
    const { data: formasPago } = useFormasPago();
    const { data: direcciones = [] } = useDirecciones();
    const { mutate: crearPedido, isPending: isPendingPedido, error: errorPedido } = useCrearPedido();
    const { mutate: crearDireccion, isPending: isPendingDir } = useCrearDireccion();

    // Estados del formulario del pedido
    const [formaPago, setFormaPago] = useState("");
    const [direccionId, setDireccionId] = useState<number | null>(null);
    const [notas, setNotas] = useState("");

    // Estado para MercadoPago Brick
    const [mpToken, setMpToken] = useState("");
    const [mpPaymentMethodId, setMpPaymentMethodId] = useState("");
    const [mpInstallments, setMpInstallments] = useState(1);
    const [mpIssuerId, setMpIssuerId] = useState("");
    const [mpDniNumber, setMpDniNumber] = useState<string | undefined>(undefined);

    // Estado para controlar si mostramos el formulario de nueva dirección
    const [mostrarFormDir, setMostrarFormDir] = useState(false);

    // Estados para los campos de la nueva dirección
    const [nuevaDir, setNuevaDir] = useState({
        alias: "",
        linea1: "",
        linea2: "",
        ciudad: "",
        provincia: "",
        codigo_postal: "",
        es_principal: false
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5ede6" }}>
                <div className="text-center px-6">
                    <p className="text-5xl mb-4">🔐</p>
                    <h2 className="text-xl font-bold text-[#2d1e0f] mb-2">Necesitás iniciar sesión</h2>
                    <p className="text-gray-500 text-sm mb-6">Para realizar tu pedido primero iniciá sesión.</p>
                    <button onClick={() => navigate("/login", { state: { from: "/realizar-pedido" } })}
                        className="bg-[#c8722a] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#a85e1f] transition-colors">
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirmarPedido = () => {
        if (!formaPago || !direccionId) return;
        if (formaPago === "MERCADOPAGO" && !mpToken) {
            alert("Completá los datos de la tarjeta para pagar con MercadoPago");
            return;
        }

        crearPedido(
            {
                forma_pago_codigo: formaPago,
                notas: notas || undefined,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
                direccion_id: direccionId,
                ...(formaPago === "MERCADOPAGO" ? {
                    token: mpToken,
                    payment_method_id: mpPaymentMethodId,
                    installments: mpInstallments,
                    issuer_id: mpIssuerId,
                    dni_number: mpDniNumber,
                } : {}),
            },
            {
                onSuccess: () => {
                    limpiar();
                    navigate("/pedidos");
                },
            }
        );
    };

    const handleGuardarDireccion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaDir.linea1 || !nuevaDir.ciudad) {
            alert("La calle/número (línea 1) y la ciudad son obligatorias");
            return;
        }
        crearDireccion({ ...nuevaDir, usuario_id: user.id }, {
            onSuccess: (direccionCreada) => {
                // Selección automática de la dirección recién creada 🎉
                setDireccionId(direccionCreada.id);
                setMostrarFormDir(false);
                // Limpiamos el formulario
                setNuevaDir({ alias: "", linea1: "", linea2: "", ciudad: "", provincia: "", codigo_postal: "", es_principal: false });
            }
        });
    };

    const errorMessage = errorPedido
        ? (errorPedido as Record<string, unknown>)?.response?.data?.detail || (errorPedido as Error).message
        : null;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
            <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
                <h1 className="font-bold text-[#2d1e0f]">Confirmar Pedido</h1>
            </div>

            <div className="px-5 py-6 max-w-lg mx-auto space-y-4">
                {/* 1. Resumen del Pedido */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Tu pedido</h3>
                    {items.map((i) => (
                        <div key={i.producto_id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">{i.cantidad}x {i.nombre}</span>
                            <span className="font-medium">${(i.precio * i.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-[#c8722a]">${total().toFixed(2)}</span>
                    </div>
                </div>

                {/* 2. Sección Direcciones */}
                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-[#2d1e0f]">Dirección de entrega</h3>
                        {!mostrarFormDir && (
                            <button
                                type="button"
                                onClick={() => setMostrarFormDir(true)}
                                className="text-xs font-bold text-[#c8722a] hover:underline"
                            >
                                ＋ Agregar nueva
                            </button>
                        )}
                    </div>

                    {/* Listado de direcciones existentes (si no se está editando una nueva o si ya hay guardadas) */}
                    {!mostrarFormDir && (
                        <>
                            {direcciones.length === 0 ? (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                    <p className="text-sm text-amber-800 mb-2">No tenés direcciones guardadas todavía.</p>
                                    <button
                                        onClick={() => setMostrarFormDir(true)}
                                        className="bg-[#c8722a] text-white text-xs font-bold px-4 py-2 rounded-lg"
                                    >
                                        Cargar una dirección
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {direcciones.map((dir) => (
                                        <label key={dir.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                            ${direccionId === dir.id ? "border-[#c8722a] bg-[#c8722a]/5" : "border-gray-100 hover:border-gray-200"}`}>
                                            <input type="radio" name="direccion" value={dir.id}
                                                checked={direccionId === dir.id} onChange={() => setDireccionId(dir.id)}
                                                className="accent-[#c8722a]" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{dir.linea1} {dir.linea2}</span>
                                                {/*<span className="text-xs text-gray-500">{dir.ciudad}, {dir.codigo_postal}</span>*/}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Formulario Inline para Crear Dirección */}
                    {mostrarFormDir && (
                        <form onSubmit={handleGuardarDireccion} className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100 animate-fadeIn">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Nueva Dirección</h4>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <input type="text" placeholder="Calle" required
                                        value={nuevaDir.linea1} onChange={e => setNuevaDir({ ...nuevaDir, linea1: e.target.value })}
                                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]" />
                                </div>
                                <div>
                                    <input type="text" placeholder="Número" required
                                        value={nuevaDir.linea2} onChange={e => setNuevaDir({ ...nuevaDir, linea2: e.target.value })}
                                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Ciudad" required
                                    value={nuevaDir.ciudad} onChange={e => setNuevaDir({ ...nuevaDir, ciudad: e.target.value })}
                                    className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]" />
                                <input type="text" placeholder="Cód. Postal"
                                    value={nuevaDir.codigo_postal} onChange={e => setNuevaDir({ ...nuevaDir, codigo_postal: e.target.value })}
                                    className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]" />
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                {direcciones.length > 0 && (
                                    <button type="button" onClick={() => setMostrarFormDir(false)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600">
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" disabled={isPendingDir}
                                    className="ml-auto bg-[#2d1e0f] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                                    {isPendingDir ? "Guardando..." : "Guardar y seleccionar"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* 3. Forma de pago */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Forma de pago</h3>
                    <div className="space-y-2">
                        {(formasPago ?? []).map((fp) => (
                            <label key={fp.codigo}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                ${formaPago === fp.codigo ? "border-[#c8722a] bg-[#c8722a]/5" : "border-gray-100 hover:border-gray-200"}`}>
                                <input type="radio" name="forma_pago" value={fp.codigo}
                                    checked={formaPago === fp.codigo} onChange={() => setFormaPago(fp.codigo)}
                                    className="accent-[#c8722a]" />
                                <span className="text-sm font-medium text-gray-700">{fp.descripcion}</span>
                            </label>
                        ))}
                    </div>

                    {/* MercadoPago Brick — formulario de tarjeta tokenizado */}
                    {formaPago === "MERCADOPAGO" && (
                        <div className="mt-4">
                            <MercadoPagoBrick
                                amount={Number(total().toFixed(2))}
                                email={user?.email}
                                publicKey={MP_PUBLIC_KEY}
                                onSubmit={(token, paymentMethodId, installments, issuerId, dniNumber) => {
                                    setMpToken(token);
                                    setMpPaymentMethodId(paymentMethodId);
                                    setMpInstallments(installments);
                                    setMpIssuerId(issuerId);
                                    setMpDniNumber(dniNumber);
                                }}
                                onError={(err) => console.error("MP Brick error:", err)}
                            />
                        </div>
                    )}
                </div>

                {/* 4. Notas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Notas (opcional)</h3>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                        placeholder="Instrucciones especiales, allergies..."
                        className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#c8722a] resize-none"
                        rows={3} />
                </div>

                {/* Feedback Errores */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        ⚠️ {typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}
                    </div>
                )}

                {/* Botón Principal */}
                <button onClick={handleConfirmarPedido}
                    disabled={!formaPago || !direccionId || isPendingPedido || items.length === 0 || mostrarFormDir}
                    className="w-full bg-[#c8722a] hover:bg-[#a85e1f] disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors
                     shadow-lg shadow-[#c8722a]/20">
                    {isPendingPedido ? "Procesando..." : "Confirmar Pedido"}
                </button>
            </div>
        </div>
    );
}