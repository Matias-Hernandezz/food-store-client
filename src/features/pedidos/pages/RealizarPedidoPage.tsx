// src/features/pedidos/pages/RealizarPedidoPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../carrito/store/carritoStore";
import { useFormasPago, useCrearPedido, useDirecciones, useCrearDireccion } from "../hooks/usePedidos";
import { useIngredientes } from "../../catalogo/hooks/useCatalogo";
import { useAuthStore } from "../../../store/authStore";
import { usePaymentStore } from "../store/paymentStore";
import { LockIcon } from "../../../assets/icons/Icons";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";
import { PagoResultadoModal } from "../components/PagoResultadoModal";
import { pedidosApi } from "../api/pedidosApi";
import type { PagoResponse } from "../store/paymentStore";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || "";

export function RealizarPedidoPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isLoading = useAuthStore((s) => s.isLoading);

    // Redirigir a login si no está autenticado
    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/login", { replace: true });
        }
        }, [user, isLoading, navigate]);

    const { items, total, limpiar } = useCarrito();
    const { data: ingredientesData } = useIngredientes();
    const ingredientesMap = new Map(
        (ingredientesData?.data ?? []).map((i) => [i.id, i.nombre])
    );

    // ─── Hooks de API ────────────────────────────────────────────────────
    const { data: formasPago } = useFormasPago();
    const { data: direcciones = [] } = useDirecciones(!!user);
    const { mutate: crearPedido, isPending: isPendingPedido, error: errorPedido } = useCrearPedido();
    const { mutate: crearDireccion, isPending: isPendingDir } = useCrearDireccion();

    // ─── Estados del formulario ──────────────────────────────────────────
    const [formaPago, setFormaPago] = useState("");
    const [direccionId, setDireccionId] = useState<number | null>(null);
    const [notas, setNotas] = useState("");
    const [mostrarFormDir, setMostrarFormDir] = useState(false);
    const [nuevaDir, setNuevaDir] = useState({
        alias: "", linea1: "", linea2: "", ciudad: "",
        provincia: "", codigo_postal: "", es_principal: false,
    });

    // ─── Payment Store ───────────────────────────────────────────────────
    const paymentFlow = usePaymentStore((s) => s.flow);
    const setPedidoCreado = usePaymentStore((s) => s.setPedidoCreado);
    const setProcessing = usePaymentStore((s) => s.setProcessing);
    const setApproved = usePaymentStore((s) => s.setApproved);
    const setRejected = usePaymentStore((s) => s.setRejected);
    const setError = usePaymentStore((s) => s.setError);
    const paymentPedidoId = usePaymentStore((s) => s.pedidoId);
    const paymentTotal = usePaymentStore((s) => s.pedidoTotal);
    const brickKey = usePaymentStore((s) => s.brickKey);
    const paymentReset = usePaymentStore((s) => s.reset);

    // ─── Resetear payment store al montar (evita estado sucio al volver) ──
    useEffect(() => { paymentReset(); }, []);

    // ─── Es MercadoPago? ─────────────────────────────────────────────────
    const esMercadoPago = formaPago === "MERCADOPAGO";

    // ─── Confirmar pedido ────────────────────────────────────────────────

    const handleConfirmarPedido = () => {
        if (!formaPago || !direccionId) return;

        crearPedido(
            {
                forma_pago_codigo: formaPago,
                notas: notas || undefined,
                items: items.map((i) => ({
                    producto_id: i.producto_id,
                    cantidad: i.cantidad,
                    personalizacion: i.personalizacion?.length ? i.personalizacion : undefined,
                })),
                direccion_id: direccionId,
            },
            {
                onSuccess: (pedidoCreado) => {
                    if (esMercadoPago) {
                        // Si es MP, no limpiamos el carrito ni navegamos — mostramos el Brick
                        setPedidoCreado(pedidoCreado.id, Number(pedidoCreado.total));
                    } else {
                        // Efectivo / Transferencia: flujo normal
                        limpiar();
                        window.location.href = "/pedidos";
                    }
                },
            }
        );
    };

    // ─── Callback del Brick: se ejecuta cuando MP tokeniza la tarjeta ────

    const handleBrickSubmit = useCallback(
        async (token: string, paymentMethodId: string, installments: number, issuerId: string, dniNumber?: string) => {
            if (!paymentPedidoId) return;

            setProcessing();

            try {
                const resultado: PagoResponse = await pedidosApi.crearPago({
                    pedido_id: paymentPedidoId,
                    token,
                    payment_method_id: paymentMethodId,
                    installments,
                    issuer_id: issuerId || undefined,
                    dni_number: dniNumber || undefined,
                });

                if (resultado.mp_status === "approved") {
                    setApproved(resultado);
                    limpiar();
                } else if (resultado.mp_status === "rejected") {
                    setRejected(resultado);
                } else {
                    // "pending" u otros → mostrar "procesando", NO limpiar carrito
                    // El WebSocket (useOrderStatusWS) va a actualizar el estado en vivo
                    setProcessing();
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Error al procesar el pago";
                setError(msg);
            }
        },
        [paymentPedidoId, setProcessing, setApproved, setRejected, setError, limpiar]
    );

    // ─── Guardar dirección nueva ─────────────────────────────────────────

    const handleGuardarDireccion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaDir.linea1 || !nuevaDir.ciudad) {
            alert("La calle y la ciudad son obligatorias");
            return;
        }
        crearDireccion(
            { ...nuevaDir, usuario_id: user!.id },
            {
                onSuccess: (direccionCreada) => {
                    setDireccionId(direccionCreada.id);
                    setMostrarFormDir(false);
                    setNuevaDir({
                        alias: "", linea1: "", linea2: "", ciudad: "",
                        provincia: "", codigo_postal: "", es_principal: false,
                    });
                },
            }
        );
    };

    // ─── Resetear flujo de pago al cambiar forma de pago ─────────────────

    const handleCambiarFormaPago = (codigo: string) => {
        setFormaPago(codigo);
        if (codigo !== "MERCADOPAGO") {
            paymentReset();
        }
    };

    // ─── No autenticado ──────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5ede6" }}>
                <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null; // useEffect ya redirige

    // ─── Estados del flujo MP ────────────────────────────────────────────

    if (esMercadoPago && paymentFlow === "awaiting_card" && paymentPedidoId) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>
                <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
                    <button
                        onClick={() => paymentReset()}
                        className="text-gray-600 text-xl"
                    >
                        ←
                    </button>
                    <h1 className="font-bold text-[#2d1e0f]">Pago con MercadoPago</h1>
                </div>
                <div className="px-5 py-6 max-w-lg mx-auto space-y-4">
                    {/* Resumen rápido */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Pedido #{paymentPedidoId}</p>
                        <p className="text-2xl font-bold text-[#c8722a] mt-1">
                            ${paymentTotal.toFixed(2)}
                        </p>
                    </div>
                    {/* Brick */}
                    <MercadoPagoBrick
                        key={`${paymentPedidoId}-${brickKey}`}
                        amount={paymentTotal}
                        email={user.email}
                        publicKey={MP_PUBLIC_KEY}
                        onSubmit={handleBrickSubmit}
                        onError={(msg) => setError(msg)}
                    />
                    {/* Seguridad */}
                    <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                        <LockIcon width={14} height={14} style={{ color: "#9a8070" }} /> Tus datos de tarjeta son procesados por MercadoPago
                    </p>
                </div>
            </div>
        );
    }

    // ─── Modal de resultado de pago ──────────────────────────────────────
    const showPagoResultado = ["processing", "approved", "rejected", "error"].includes(paymentFlow);

    // ─── Render normal del checkout ──────────────────────────────────────

    const errorMessage = errorPedido
        ? (errorPedido as Error).message
        : null;

    return (
        <>
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
                            <div>
                                <span className="text-gray-600">
                                    {i.cantidad}x {i.nombre}
                                </span>
                                {i.personalizacion?.length > 0 && (
                                    <p className="text-[11px] text-red-500 italic mt-0.5">
                                        Sin: {ingredientesMap.size > 0
                                            ? i.personalizacion.map((id) => ingredientesMap.get(id) ?? `#${id}`).join(", ")
                                            : `${i.personalizacion.length} ingrediente(s)`}
                                    </p>
                                )}
                            </div>
                            <span className="font-medium">
                                ${(i.precio * i.cantidad).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-[#c8722a]">${total().toFixed(2)}</span>
                    </div>
                </div>

                {/* 2. Dirección de entrega */}
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

                    {!mostrarFormDir && (
                        <>
                            {direcciones.length === 0 ? (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                    <p className="text-sm text-amber-800 mb-2">
                                        No tenés direcciones guardadas todavía.
                                    </p>
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
                                        <label
                                            key={dir.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${direccionId === dir.id
                                                    ? "border-[#c8722a] bg-[#c8722a]/5"
                                                    : "border-gray-100 hover:border-gray-200"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="direccion"
                                                value={dir.id}
                                                checked={direccionId === dir.id}
                                                onChange={() => setDireccionId(dir.id)}
                                                className="accent-[#c8722a]"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {dir.linea1} {dir.linea2}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {mostrarFormDir && (
                        <form
                            onSubmit={handleGuardarDireccion}
                            className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100"
                        >
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Nueva Dirección
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <input
                                        type="text" placeholder="Calle" required
                                        value={nuevaDir.linea1}
                                        onChange={(e) => setNuevaDir({ ...nuevaDir, linea1: e.target.value })}
                                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text" placeholder="Número" required
                                        value={nuevaDir.linea2}
                                        onChange={(e) => setNuevaDir({ ...nuevaDir, linea2: e.target.value })}
                                        className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text" placeholder="Ciudad" required
                                    value={nuevaDir.ciudad}
                                    onChange={(e) => setNuevaDir({ ...nuevaDir, ciudad: e.target.value })}
                                    className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]"
                                />
                                <input
                                    type="text" placeholder="Cód. Postal"
                                    value={nuevaDir.codigo_postal}
                                    onChange={(e) => setNuevaDir({ ...nuevaDir, codigo_postal: e.target.value })}
                                    className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#c8722a]"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                {direcciones.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setMostrarFormDir(false)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isPendingDir}
                                    className="ml-auto bg-[#2d1e0f] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                >
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
                            <label
                                key={fp.codigo}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formaPago === fp.codigo
                                        ? "border-[#c8722a] bg-[#c8722a]/5"
                                        : "border-gray-100 hover:border-gray-200"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="forma_pago"
                                    value={fp.codigo}
                                    checked={formaPago === fp.codigo}
                                    onChange={() => handleCambiarFormaPago(fp.codigo)}
                                    className="accent-[#c8722a]"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {fp.descripcion}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 4. Notas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-[#2d1e0f] mb-3">Notas (opcional)</h3>
                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Instrucciones especiales, alergias..."
                        className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#c8722a] resize-none"
                        rows={3}
                    />
                </div>

                {/* Feedback Errores */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        ⚠️ {errorMessage}
                    </div>
                )}

                {/* Botón Principal */}
                <button
                    onClick={handleConfirmarPedido}
                    disabled={
                        !formaPago ||
                        !direccionId ||
                        isPendingPedido ||
                        items.length === 0 ||
                        mostrarFormDir
                    }
                    className="w-full bg-[#c8722a] hover:bg-[#a85e1f] disabled:opacity-50 disabled:cursor-not-allowed
           text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors
           shadow-lg shadow-[#c8722a]/20"
                >
                    {isPendingPedido
                        ? "Procesando..."
                        : esMercadoPago
                            ? "Confirmar y pagar con MercadoPago"
                            : "Confirmar Pedido"}
                </button>
            </div>
        </div>
        {showPagoResultado && <PagoResultadoModal onClose={paymentReset} />}
        </>
    );
}