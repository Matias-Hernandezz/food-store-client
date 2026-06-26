import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../shared/api/axiosClient";
import { useCarrito } from "../../../store/carritoStore";
import { usePedidos } from "../hooks/usePedidos";
import { useAuthStore } from "../../../store/authStore";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";
import { PagoResultadoModal } from "../components/PagoResultadoModal";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { ConfirmModal } from "../../../shared/components/ConfirmModal";
import { XCircleIcon } from "../../../assets/icons/Icons";
import { usePaymentStore } from "../../../store/paymentStore";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || "TEST-xxxxxxxxxxxxxxxxxxxx";
interface ApiErrorResponse {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

interface IngredienteSimple { id: number; nombre: string }

export function RealizarPedidoPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { items, total, limpiar } = useCarrito();
    const monto = useMemo(() => total(), [items]);

    // Fetch ingredientes para resolver IDs en personalizacion
    const { data: ingredientesData } = useQuery({
        queryKey: ["ingredientes"],
        queryFn: () => api.get<{ data: IngredienteSimple[] }>("/api/v1/ingredientes/?limit=100").then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });
    const ingredientesMap = useMemo(() => new Map(
        (ingredientesData?.data ?? []).map((i) => [i.id, i.nombre])
    ), [ingredientesData]);

    // Hooks de la API
    const pedidos = usePedidos({});
    const formasPago = pedidos.formasPago;
    const direcciones = pedidos.direcciones ?? [];
    const crearPedido = pedidos.crearPedido.mutate;
    const isPendingPedido = pedidos.crearPedido.isPending;
    const errorPedido = pedidos.crearPedido.error;
    const crearPago = pedidos.crearPago.mutate;
    const isPendingPago = pedidos.crearPago.isPending;
    const crearDireccion = pedidos.crearDireccion.mutate;
    const isPendingDir = pedidos.crearDireccion.isPending;
    const eliminarDireccion = pedidos.eliminarDireccion.mutate;

    // Estados del formulario del pedido
    const [formaPago, setFormaPago] = useState("");
    const [direccionId, setDireccionId] = useState<number | null>(null);
    const [notas, setNotas] = useState("");
    const [showPagoModal, setShowPagoModal] = useState(false);

    // Controla si ya se debe mostrar el formulario de tarjeta de MercadoPago.
    // Solo se muestra DESPUÉS de apretar "Confirmar Pedido" con MP seleccionado.
    const [showMpForm, setShowMpForm] = useState(false);
    const [brickKey, setBrickKey] = useState(0);

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

    // Estados para eliminar dirección y errores
    const [direccionAEliminar, setDireccionAEliminar] = useState<number | null>(null);
    const [errorDireccion, setErrorDireccion] = useState<string | null>(null);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8D5C0" }}>
                <div className="text-center px-6">
                    <p className="text-5xl mb-4">🔐</p>
                    <h2 className="text-xl font-bold text-[#2d1e0f] mb-2">Necesitás iniciar sesión</h2>
                    <p className="text-[#9a8070] text-sm mb-6">Para realizar tu pedido primero iniciá sesión.</p>
                    <button onClick={() => navigate("/login", { state: { from: "/realizar-pedido" } })}
                        className="bg-[#C87A2E] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#B06920] transition-colors">
                        Iniciar sesión
                    </button>
                </div>
            </div>
        );
    }

    // ─── Crear pedido para formas de pago SIN tokenización (efectivo, transferencia) ───

    const handleConfirmarPedido = () => {
        if (!formaPago || !direccionId) return;

        crearPedido(
            {
                forma_pago_codigo: formaPago,
                notas: notas || undefined,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad, personalizacion: i.personalizacion })),
                direccion_id: direccionId,
            },
            {
                onSuccess: (pedido) => {
                    limpiar();
                    usePaymentStore.getState().setPedidoCreado(pedido.id, total());
                    navigate("/pedidos");
                },
            }
        );
    };

    // ─── Crear pedido CON los datos tokenizados que vienen del Brick de MP ───
    // Recibe los datos directo como parámetros (no desde state) para evitar
    // quedarnos con valores viejos por la asincronía de setState.

    const handleMpSubmit = (
        token: string,
        paymentMethodId: string,
        installments: number,
        issuerId: string,
        dniNumber?: string,
    ) => {
        if (!direccionId) return;

        // Paso 1: crear el Pedido (sin datos de pago — el backend no los acepta ahí)
        crearPedido(
            {
                forma_pago_codigo: "MERCADOPAGO",
                notas: notas || undefined,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad, personalizacion: i.personalizacion })),
                direccion_id: direccionId,
            },
            {
                onSuccess: (pedido) => {
                    // Guardar pedidoId en el store ANTES de crear el pago
                    usePaymentStore.getState().setPedidoCreado(pedido.id, total());
                    usePaymentStore.getState().setProcessing();
                    // Paso 2: con el pedido_id ya creado, mandamos el token de la tarjeta
                    // al endpoint dedicado de Pagos (PCI SAQ-A: la tarjeta nunca toca nuestro backend)
                    crearPago(
                        {
                            pedido_id: pedido.id,
                            token,
                            payment_method_id: paymentMethodId,
                            installments,
                            issuer_id: issuerId,
                            dni_number: dniNumber,
                        },
                        {
                            onSuccess: (pago) => {
                                if (pago.mp_status === "approved") {
                                    usePaymentStore.getState().setApproved(pago);
                                } else if (pago.mp_status === "rejected") {
                                    usePaymentStore.getState().setRejected(pago);
                                } else if (pago.mp_status === "error") {
                                    usePaymentStore.getState().setError(
                                        pago.mp_status_detail || "Error al procesar el pago con MercadoPago"
                                    );
                                } else {
                                    // pending, in_process, authorized — sigue procesando
                                    usePaymentStore.getState().setProcessing();
                                    // Si en 15s sigue en processing, avisar que está demorando
                                    setTimeout(() => {
                                        const state = usePaymentStore.getState();
                                        if (state.flow === "processing") {
                                            usePaymentStore.setState({
                                                errorMsg: "El pago está tardando más de lo normal. No cierres esta ventana.",
                                            });
                                        }
                                    }, 15000);
                                }
                                setShowPagoModal(true);
                            },
                            onError: (err: any) => {
                                usePaymentStore.getState().setError(
                                    err?.response?.data?.detail || "Error al procesar el pago"
                                );
                                setShowPagoModal(true);
                            },
                        }
                    );
                },
                onError: (err: any) => {
                    usePaymentStore.getState().setError(
                        err?.response?.data?.detail || "Error al crear el pedido"
                    );
                    setShowPagoModal(true);
                },
            }
        );
    };

    // ─── Click en el botón principal ───
    // Solo para formas de pago SIN tokenización (efectivo, transferencia).
    // MercadoPago se maneja directamente desde el Brick.

    const handleConfirmarClick = () => {
        if (!formaPago || !direccionId) return;
        handleConfirmarPedido();
    };

    const handleGuardarDireccion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaDir.linea1 || !nuevaDir.ciudad) {
            alert("La calle/número (línea 1) y la ciudad son obligatorias");
            return;
        }
        crearDireccion({ ...nuevaDir, usuario_id: user.id }, {
            onSuccess: (direccionCreada) => {
                setErrorDireccion(null);
                setDireccionId(direccionCreada.id);
                setMostrarFormDir(false);
                setNuevaDir({ alias: "", linea1: "", linea2: "", ciudad: "", provincia: "", codigo_postal: "", es_principal: false });
            },
            onError: (err: any) => {
                const detail = err?.response?.data?.detail || "Error al guardar la dirección";
                setErrorDireccion(detail);
            }
        });
    };

    const errorMessage = errorPedido
        ? (errorPedido as ApiErrorResponse)?.response?.data?.detail || (errorPedido as Error).message
        : null;

    // Si cambia la forma de pago, mostrar/ocultar Brick según corresponda
    const handleCambiarFormaPago = (codigo: string) => {
        setFormaPago(codigo);
        if (codigo === "MERCADOPAGO") {
            setBrickKey(k => k + 1);
            setShowMpForm(true);
        } else if (codigo === "TRANSFERENCIA") {
            setShowMpForm(true);
        } else {
            setShowMpForm(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#E8D5C0" }}>
            <div className="bg-[#F2E8D5] px-5 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="text-[#2d1e0f] text-xl">←</button>
                <h1 className="font-bold text-[#2d1e0f] flex-1">Confirmar Pedido</h1>
                <ConnectionBadge />
            </div>

            {/* ─── Stepper ─── */}
            <div className="bg-[#F2E8D5] border-b border-[#3D2B1F]/10 px-5 py-3">
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                    {["Dirección", "Pago", "Confirmar"].map((label, i) => {
                        const pasoCompletado = showPagoModal ? true :
                            i === 0 ? !!direccionId :
                            i === 1 ? !!(direccionId && formaPago) :
                            i === 2 ? !!(direccionId && formaPago && !showMpForm) :
                            false;
                        const pasoActual = showPagoModal ? false :
                            showMpForm ? i === 1 :
                            i === 0 && !direccionId ? true :
                            i === 1 && direccionId && !formaPago ? true :
                            i === 2 && direccionId && formaPago ? true :
                            false;
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                        ${pasoActual ? "bg-[#C87A2E] text-white" : pasoCompletado ? "bg-[#2d1e0f] text-white" : "bg-[#E8D5C0] text-[#9a8070]"}`}>
                                        {pasoCompletado ? "✓" : i + 1}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:inline ${pasoActual ? "text-[#C87A2E]" : pasoCompletado ? "text-[#2d1e0f]" : "text-[#9a8070]"}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < 2 && (
                                    <div className={`w-8 h-0.5 hidden sm:block ${pasoCompletado ? "bg-[#C87A2E]" : "bg-[#E8D5C0]"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`px-5 py-6 mx-auto ${showMpForm ? "max-w-full xl:max-w-6xl" : "max-w-full md:max-w-4xl"}`}>
                <div className={`flex gap-6 ${showMpForm ? "flex-col lg:flex-row items-start" : "flex-col max-w-lg mx-auto"}`}>
                    {/* ── Columna izquierda ── */}
                    <div className={`space-y-4 ${showMpForm ? "lg:flex-1" : "w-full"}`}>
                        {/* 1. Resumen del Pedido */}
                        <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-[#2d1e0f] mb-3">Tu pedido</h3>
                            {items.map((i) => (
                                <div key={i.producto_id}>
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-[#2d1e0f]">{i.cantidad}x {i.nombre}</span>
                                        <span className="font-medium">${(i.precio * i.cantidad).toFixed(2)}</span>
                                    </div>
                                    {i.personalizacion?.length > 0 && (
                                        <p className="text-[10px] text-red-500 italic ml-1 -mt-1 mb-1">
                                            Sin: {ingredientesMap.size > 0
                                                ? i.personalizacion.map((id: number) => ingredientesMap.get(id) ?? `#${id}`).join(", ")
                                                : `${i.personalizacion.length} ingrediente(s)`}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <div className="border-t border-[#3D2B1F] mt-3 pt-3 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-[#2d1e0f]">${total().toFixed(2)}</span>
                            </div>
                        </div>

                        {/* 2. Sección Direcciones */}
                        <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-[#2d1e0f]">Dirección de entrega</h3>
                                {!mostrarFormDir && (
                                    <button
                                        type="button"
                                        onClick={() => { setErrorDireccion(null); setMostrarFormDir(true); }}
                                        className="text-xs font-bold text-[#2d1e0f] hover:underline"
                                    >
                                        ＋ Agregar nueva
                                    </button>
                                )}
                            </div>

                            {!mostrarFormDir && (
                                <>
                                    {direcciones.length === 0 ? (
                                        <div className="bg-[#F2E8D5] p-4 rounded-xl border border-[#3D2B1F] text-center">
                                            <p className="text-sm text-[#2d1e0f] mb-2">No tenés direcciones guardadas todavía.</p>
                                            <button
                                                onClick={() => { setErrorDireccion(null); setMostrarFormDir(true); }}
                                                className="bg-[#C87A2E] text-white text-xs font-bold px-4 py-2 rounded-lg"
                                            >
                                                Cargar una dirección
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {direcciones.map((dir) => (
                                                <div key={dir.id} className="relative">
                                                    <div
                                                        onClick={() => setDireccionId(direccionId === dir.id ? null : dir.id)}
                                                        className={`flex items-center gap-3 p-3 pr-10 rounded-xl border-2 cursor-pointer transition-all
                                                        ${direccionId === dir.id ? "border-[#2d1e0f] bg-[#C87A2E]/5" : "border-[#3D2B1F] hover:border-[#3D2B1F]"}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                            ${direccionId === dir.id ? "border-[#2d1e0f] bg-[#2d1e0f]" : "border-[#3D2B1F]"}`}>
                                                            {direccionId === dir.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-bold text-[#2d1e0f]">{dir.linea1} {dir.linea2}</span>
                                                            <span className="text-xs text-[#9a8070]">{dir.ciudad}{dir.provincia ? `, ${dir.provincia}` : ""}</span>
                            </div>
                        </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setDireccionAEliminar(dir.id);
                                                        }}
                                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-[#9a8070] hover:text-red-500 hover:bg-[#e05a3a]/10 transition-colors text-sm font-bold"
                                                        title="Eliminar dirección"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {mostrarFormDir && (
                                <form onSubmit={handleGuardarDireccion} className="bg-[#F2E8D5] p-4 rounded-xl space-y-3 border border-[#3D2B1F] animate-fadeIn">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-[#9a8070]">Nueva Dirección</h4>

                                    {errorDireccion && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 flex items-start gap-2">
                                            <XCircleIcon width={16} height={16} className="flex-shrink-0 mt-0.5" />
                                            <span>{errorDireccion}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <input type="text" placeholder="Calle" required
                                                value={nuevaDir.linea1} onChange={e => setNuevaDir({ ...nuevaDir, linea1: e.target.value })}
                                                className="w-full text-sm border border-[#3D2B1F] rounded-xl p-2.5 focus:outline-none focus:border-[#2d1e0f]" />
                                        </div>
                                        <div>
                                            <input type="text" placeholder="Número" required
                                                value={nuevaDir.linea2} onChange={e => setNuevaDir({ ...nuevaDir, linea2: e.target.value })}
                                                className="w-full text-sm border border-[#3D2B1F] rounded-xl p-2.5 focus:outline-none focus:border-[#2d1e0f]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" placeholder="Ciudad" required
                                            value={nuevaDir.ciudad} onChange={e => setNuevaDir({ ...nuevaDir, ciudad: e.target.value })}
                                            className="w-full text-sm border border-[#3D2B1F] rounded-xl p-2.5 focus:outline-none focus:border-[#2d1e0f]" />
                                        <input type="text" placeholder="Cód. Postal"
                                            value={nuevaDir.codigo_postal} onChange={e => setNuevaDir({ ...nuevaDir, codigo_postal: e.target.value })}
                                            className="w-full text-sm border border-[#3D2B1F] rounded-xl p-2.5 focus:outline-none focus:border-[#2d1e0f]" />
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        {direcciones.length > 0 && (
                                            <button type="button" onClick={() => { setErrorDireccion(null); setMostrarFormDir(false); }}
                                                className="text-xs font-bold text-[#9a8070] hover:text-[#2d1e0f]">
                                                Cancelar
                                            </button>
                                        )}
                                        <button type="submit" disabled={isPendingDir}
                                            className="ml-auto text-xs font-bold text-[#9a8070] hover:text-[#2d1e0f] transition-colors disabled:opacity-50">
                                            {isPendingDir ? "Guardando..." : "Guardar y seleccionar"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* 3. Forma de pago */}
                        {
                            <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold text-[#2d1e0f] mb-3">Forma de pago</h3>
                                <div className="space-y-2">
                                    {(formasPago ?? []).map((fp) => (
                                        <label key={fp.codigo}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                            ${formaPago === fp.codigo ? "border-[#2d1e0f] bg-[#C87A2E]/5" : "border-[#3D2B1F] hover:border-[#3D2B1F]"}`}>
                                            <input type="radio" name="forma_pago" value={fp.codigo}
                                                checked={formaPago === fp.codigo} onChange={() => handleCambiarFormaPago(fp.codigo)}
                                                className="accent-[#2d1e0f]" />
                                            <span className="text-sm font-medium text-[#2d1e0f]">{fp.descripcion}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>

                    {/* ── Columna derecha ── */}
                    {showMpForm && (
                        <div className="lg:flex-1 w-full lg:sticky lg:top-20">
                            {formaPago === "MERCADOPAGO" && monto > 0 ? (
                                <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm">
                                    <h3 className="font-bold text-[#2d1e0f] mb-1">Pago con MercadoPago</h3>
                                    <p className="text-xs text-[#9a8070] mb-4">Total: <span className="font-bold text-[#2d1e0f]">${monto.toFixed(2)}</span></p>
                                    <MercadoPagoBrick
                                        key={brickKey}
                                        amount={monto}
                                        email={user?.email}
                                        publicKey={MP_PUBLIC_KEY}
                                        onSubmit={handleMpSubmit}
                                        onError={(err) => console.error("MP Brick error:", err)}
                                    />
                                </div>
                            ) : (
                                <div className="bg-[#F2E8D5] rounded-2xl p-8 shadow-sm text-center">
                                    <p className="text-4xl mb-4">🚧</p>
                                    <h3 className="font-bold text-[#2d1e0f] mb-2">Estamos construyendo esta parte</h3>
                                    <p className="text-sm text-[#9a8070]">Seleccioná otro medio de pago por ahora.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notas + error + botón (solo cuando no se muestra MP) */}
                {formaPago !== "MERCADOPAGO" && formaPago !== "TRANSFERENCIA" && (
                    <>
                        <div className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm mt-4 max-w-lg mx-auto w-full">
                            <h3 className="font-bold text-[#2d1e0f] mb-3">Notas (opcional)</h3>
                            <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                                placeholder="Instrucciones especiales, allergies..."
                                className="w-full text-sm border border-[#3D2B1F] rounded-xl p-3 focus:outline-none focus:border-[#2d1e0f] resize-none"
                                rows={3} />
                        </div>

                        {errorMessage && (
                            <div className="bg-[#e05a3a]/10 border border-[#e05a3a]/30 text-[#e05a3a] text-sm rounded-xl px-4 py-3 mt-4 max-w-lg mx-auto">
                                ⚠️ {typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}
                            </div>
                        )}

                        <div className="mt-4 max-w-lg mx-auto">
                            <button onClick={handleConfirmarClick}
                                disabled={!formaPago || !direccionId || isPendingPedido || isPendingPago || items.length === 0 || mostrarFormDir}
                                className="w-full bg-[#C87A2E] hover:bg-[#B06920] disabled:opacity-50 disabled:cursor-not-allowed
                                 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors
                                 shadow-lg shadow-[#2d1e0f]/20">
                                {isPendingPedido || isPendingPago ? "Procesando..." : "Confirmar Pedido"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showPagoModal && (
                <PagoResultadoModal onClose={() => { limpiar(); navigate("/pedidos"); }} />
            )}

            <ConfirmModal
                open={direccionAEliminar !== null}
                mensaje="¿Eliminar esta dirección?"
                onConfirmar={() => {
                    if (direccionId === direccionAEliminar) setDireccionId(null);
                    eliminarDireccion(direccionAEliminar!);
                    setDireccionAEliminar(null);
                }}
                onCancelar={() => setDireccionAEliminar(null)}
            />
        </div>
    );
}