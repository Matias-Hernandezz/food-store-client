// src/features/catalogo/components/CartDrawer.tsx
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../store/carritoStore";

interface CartDrawerProps {
    onClose: () => void;
}

export const CartDrawer = ({ onClose }: CartDrawerProps) => {
    const navigate = useNavigate();
    const { items, quitar, cambiarCantidad, total } = useCarrito();
    const subtotal = total();
    const envio = subtotal > 0 ? 4.5 : 0;
    const totalFinal = subtotal + envio;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 30,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
            />
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(420px,100vw)", background: "#fff", zIndex: 40,
                display: "flex", flexDirection: "column",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
                animation: "slideIn 0.3s ease",
            }}>
                {/* Header */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0e8e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2d1e0f", fontFamily: "Georgia, serif" }}>Tu Canasta</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "#9a8070" }}>
                            {items.length} {items.length === 1 ? "producto" : "productos"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "#f5ede6", border: "none", borderRadius: 12, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#c8722a", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >✕</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "#9a8070" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
                            <p style={{ margin: 0, fontWeight: 600 }}>Tu canasta está vacía</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {items.map((item) => (
                                <div key={item.producto_id} style={{ display: "flex", gap: 12, background: "#fdf9f6", borderRadius: 16, padding: 12 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 12, background: "#f0e8e0", flexShrink: 0, overflow: "hidden" }}>
                                        {item.imagen_url
                                            ? <img src={item.imagen_url} alt={item.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🍽️</div>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#2d1e0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</p>
                                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#c8722a", fontWeight: 700 }}>${item.precio.toFixed(2)} c/u</p>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e8ddd5", borderRadius: 99, padding: "4px 12px" }}>
                                                <button onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#c8722a", lineHeight: 1 }}>−</button>
                                                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: "center" }}>{item.cantidad}</span>
                                                <button onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#c8722a", lineHeight: 1 }}>+</button>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontWeight: 800, color: "#2d1e0f", fontSize: 15 }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                                                <button onClick={() => quitar(item.producto_id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#d4b5a0" }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #f0e8e0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9a8070", marginBottom: 6 }}>
                            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9a8070", marginBottom: 12 }}>
                            <span>Envío</span><span>${envio.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "#2d1e0f", marginBottom: 16 }}>
                            <span>Total</span>
                            <span style={{ color: "#c8722a" }}>${totalFinal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => { onClose(); navigate("/realizar-pedido"); }}
                            style={{ width: "100%", background: "#c8722a", color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                            Confirmar Pedido →
                        </button>
                    </div>
                )}
            </div>
            <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        </>
    );
};