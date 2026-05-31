import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../carrito/store/carritoStore";
import {
    useDirecciones,
    useFormasPago,
    useCrearPedido
} from "../hooks/usePedidos";

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, total, limpiar } = useCarrito();

    const [selectedDireccion, setSelectedDireccion] = useState<number | null>(null);
    const [selectedPago, setSelectedPago] = useState<string>("");
    const [notas, setNotas] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const { data: direcciones = [], isLoading: isLoadingDir } = useDirecciones();
    const { data: formasPago = [], isLoading: isLoadingPago } = useFormasPago();
    const crearPedido = useCrearPedido();

    const subtotal = total();
    const envio = subtotal > 0 ? 4.5 : 0;
    const totalFinal = subtotal + envio;

    // Si el carrito está vacío, no debería estar acá
    if (items.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "60px", color: "#9a8070" }}>
                <h2>Tu canasta está vacía</h2>
                <button onClick={() => navigate("/")} style={btnStyle}>Volver al Catálogo</button>
            </div>
        );
    }

    const handleConfirmarPedido = () => {
        setErrorMsg("");

        // Validación Front-End (para no molestar al backend)
        if (!selectedDireccion) return setErrorMsg("Selecciona una dirección de entrega.");
        if (!selectedPago) return setErrorMsg("Selecciona un método de pago.");

        // Transformar los items del store al formato que espera el backend
        const itemsPayload = items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad
        }));

        crearPedido.mutate({
            direccion_id: selectedDireccion,
            forma_pago_codigo: selectedPago,
            notas: notas || undefined,
            items: itemsPayload
        }, {
            onSuccess: (nuevoPedido) => {
                limpiar(); // Vaciamos el carrito local
                // Redirigir a una página de éxito
                navigate(`/pedido-exitoso/${nuevoPedido.id}`);
            },
            onError: (err: any) => {
                // Manejar error (401 si no está logueado, 400 si la dirección es falsa)
                setErrorMsg(err?.message || "Ocurrió un error al procesar el pedido.");
            }
        });
    };

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#2d1e0f", fontFamily: "Georgia, serif" }}>Finalizar Pedido</h1>

            {errorMsg && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                    {errorMsg}
                </div>
            )}

            {/* 1. SELECCIÓN DE DIRECCIÓN */}
            <section style={sectionStyle}>
                <h3 style={titleStyle}>1. Dirección de Entrega</h3>
                {isLoadingDir ? <p>Cargando direcciones...</p> : (
                    <>
                        {direcciones.length === 0 ? (
                            <p style={{ color: "#c8722a" }}>No tienes direcciones guardadas. Debes crear una en tu perfil.</p>
                            // Aquí podrías mostrar un botón para abrir un modal de "Nueva Dirección"
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {direcciones.map(dir => (
                                    <label key={dir.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: selectedDireccion === dir.id ? "2px solid #c8722a" : "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>
                                        <input
                                            type="radio"
                                            name="direccion"
                                            value={dir.id}
                                            checked={selectedDireccion === dir.id}
                                            onChange={() => setSelectedDireccion(dir.id)}
                                        />
                                        <div>
                                            <strong>{dir.calle} {dir.numero}</strong> {dir.es_principal && <span style={{ fontSize: "12px", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>Principal</span>}<br />
                                            <span style={{ fontSize: "14px", color: "#6b7280" }}>{dir.ciudad}, {dir.codigo_postal}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* 2. FORMA DE PAGO */}
            <section style={sectionStyle}>
                <h3 style={titleStyle}>2. Método de Pago</h3>
                {isLoadingPago ? <p>Cargando métodos de pago...</p> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {formasPago.filter(f => f.habilitado).map(forma => (
                            <label key={forma.codigo} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: selectedPago === forma.codigo ? "2px solid #c8722a" : "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="pago"
                                    value={forma.codigo}
                                    checked={selectedPago === forma.codigo}
                                    onChange={() => setSelectedPago(forma.codigo)}
                                />
                                <strong>{forma.descripcion}</strong>
                            </label>
                        ))}
                    </div>
                )}
            </section>

            {/* 3. NOTAS DEL PEDIDO */}
            <section style={sectionStyle}>
                <h3 style={titleStyle}>3. Notas adicionales (opcional)</h3>
                <textarea
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", minHeight: "80px" }}
                    placeholder="Ej. Tocar timbre fuerte, dejar en portería..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                />
            </section>

            {/* RESUMEN FINAL */}
            <div style={{ padding: "24px", background: "#fdf9f6", borderRadius: "16px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span>Envío</span><span>${envio.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "bold", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginBottom: "20px" }}>
                    <span>Total</span><span style={{ color: "#c8722a" }}>${totalFinal.toFixed(2)}</span>
                </div>

                <button
                    onClick={handleConfirmarPedido}
                    disabled={crearPedido.isPending || isLoadingDir || direcciones.length === 0}
                    style={{
                        ...btnStyle,
                        width: "100%",
                        opacity: (crearPedido.isPending || direcciones.length === 0) ? 0.5 : 1
                    }}
                >
                    {crearPedido.isPending ? "Procesando..." : "Confirmar Pago y Pedido"}
                </button>
            </div>
        </div>
    );
};

// Estilos sueltos para mantener el archivo limpio
const sectionStyle = { marginBottom: "30px" };
const titleStyle = { margin: "0 0 15px 0", fontSize: "18px", color: "#2d1e0f" };
const btnStyle = { background: "#c8722a", color: "#fff", border: "none", borderRadius: "16px", padding: "16px", fontSize: "14px", fontWeight: 800, textTransform: "uppercase" as const, cursor: "pointer" };