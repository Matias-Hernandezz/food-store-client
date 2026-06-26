// src/features/pedidos/components/PedidosModal.tsx
import { useNavigate } from "react-router-dom";
import { usePedidos, ESTADO_LABEL, ESTADO_COLOR } from "../hooks/usePedidos";
import { toNumber } from "../../../shared/types";
import { useAuthStore } from "../../../store/authStore";
import { OrderTimeline } from "./OrderTimeline";
import { ConnectionBadge } from "./ConnectionBadge";
import { ReceiptIcon } from "../../../assets/icons/Icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PedidosModal({ open, onClose }: Props) {
  const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
  const { data, isLoading } = usePedidos({});
  const pedidos = data?.data ?? [];

  if (!open) return null;

  if (!user) {
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 60, background: "#F2E8D5", borderRadius: 24, padding: 40, textAlign: "center", width: "min(320px, 90vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <ReceiptIcon width={48} height={48} style={{ color: "#2d1e0f", opacity: 0.4, marginBottom: 16 }} />
          <p style={{ color: "#9a8070", marginBottom: 20, fontWeight: 600 }}>Iniciá sesión para ver tus pedidos</p>
          <button onClick={() => { onClose(); navigate("/login"); }} style={{ background: "#2d1e0f", color: "#F2E8D5", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Iniciar sesión
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop con blur */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 60,
          width: "min(480px, 92vw)",
          maxHeight: "85vh",
          background: "#F2E8D5",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e8ddd5", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2d1e0f", fontFamily: "Georgia, serif" }}>Mis Pedidos</h2>
            <ConnectionBadge />
          </div>
          <button
            onClick={onClose}
            style={{ background: "#F2E8D5", border: "none", borderRadius: 12, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#2d1e0f", display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div className="w-8 h-8 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pedidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9a8070" }}>
              <ReceiptIcon width={48} height={48} style={{ color: "#2d1e0f", opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontWeight: 600, margin: "0 0 20px" }}>No tenés pedidos todavía</p>
              <button
                onClick={() => { onClose(); navigate("/"); }}
                style={{ background: "#2d1e0f", color: "#F2E8D5", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Ver menú
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pedidos.map((p) => (
                <div key={p.id} style={{ background: "#F2E8D5", borderRadius: 16, padding: 16, border: "1px solid #e8ddd5" }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#2d1e0f" }}>Pedido #{p.id}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#b09080" }}>
                        {new Date(p.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLOR[p.estado_codigo] || "bg-[#F2E8D5] text-[#2d1e0f]"}`}
                      style={{ fontSize: 10 }}>
                      {ESTADO_LABEL[p.estado_codigo] || p.estado_codigo}
                    </span>
                  </div>

                  {/* Timeline */}
                  <OrderTimeline estadoActual={p.estado_codigo} />

                  {/* Detalles */}
                  <div style={{ margin: "8px 0" }}>
                    {p.detalles?.map((d) => (
                      <p key={d.producto_id} style={{ margin: 0, fontSize: 12, color: "#5a4a3a" }}>
                        {d.cantidad}x {d.nombre_snapshot}
                      </p>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #e8ddd5", paddingTop: 10, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "#9a8070" }}>Total</span>
                    <span style={{ fontSize: 14, color: "#2d1e0f" }}>${toNumber(p.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
