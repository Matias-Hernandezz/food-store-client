// src/features/pedidos/components/PagoResultadoModal.tsx
import { useEffect } from "react";
import { usePaymentStore } from "../../../store/paymentStore";
import { pedidosApi } from "../api/pedidosApi";

interface Props {
  onClose: () => void;
}

export function PagoResultadoModal({ onClose }: Props) {
  const pago = usePaymentStore((s) => s.pago);
  const pedidoId = usePaymentStore((s) => s.pedidoId);
  const intentos = usePaymentStore((s) => s.intentos);
  const flow = usePaymentStore((s) => s.flow);
  const errorMsg = usePaymentStore((s) => s.errorMsg);
  const reset = usePaymentStore((s) => s.reset);
  const retry = usePaymentStore((s) => s.retry);

  const handleVerPedidos = () => {
    reset();
    onClose();
  };

  const handleReintentar = () => {
    retry(); // vuelve a awaiting_card manteniendo el pedidoId
  };

  // ── Polling: consultar estado real del pago cada 4s (máx 2 min) ──────
  const MAX_POLL_INTENTOS = 30; // 30 × 4s = 2 minutos

  useEffect(() => {
    if (flow !== "processing" || !pedidoId) return;

    let intentos = 0;
    const interval = setInterval(async () => {
      intentos++;
      try {
        const actualizado = await pedidosApi.consultarPago(pedidoId);
        if (actualizado.mp_status === "approved") {
          usePaymentStore.getState().setApproved(actualizado);
          clearInterval(interval);
        } else if (actualizado.mp_status === "rejected") {
          usePaymentStore.getState().setRejected(actualizado);
          clearInterval(interval);
        } else if (intentos >= MAX_POLL_INTENTOS) {
          usePaymentStore.getState().setError(
            "No pudimos confirmar tu pago. Revisá el estado en Mis Pedidos."
          );
          clearInterval(interval);
        }
      } catch {
        if (intentos >= MAX_POLL_INTENTOS) {
          usePaymentStore.getState().setError(
            "Perdimos la conexión al verificar tu pago. Revisá Mis Pedidos."
          );
          clearInterval(interval);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [flow, pedidoId]);

  // ── Aprobado ─────────────────────────────────────────────────────────
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
        <div
          style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 60,
            width: "min(380px, 90vw)",
            background: "#F2E8D5", borderRadius: 24, padding: 32,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          {/* Mini Stepper */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
            {["Dirección", "Pago", "Confirmar"].map((label, i) => {
              const aprobado = pago?.mp_status === "approved";
              const completado = aprobado ? true : i < 2;
              const esRechazado = !aprobado && i === 2 && pago?.mp_status === "rejected";
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: esRechazado ? "#ef4444" : completado ? "#2d1e0f" : "#E8D5C0",
                    color: "#fff",
                  }}>
                    {esRechazado ? "✕" : completado ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: completado ? "#2d1e0f" : "#9a8070" }}>
                    {label}
                  </span>
                  {i < 2 && (
                    <div style={{ width: 16, height: 1, background: completado ? "#C87A2E" : "#E8D5C0", margin: "0 4px" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Estado visual */}
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {pago?.mp_status === "approved" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C87A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : pago?.mp_status === "rejected" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <div className="w-10 h-10 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold mb-2" style={{ color: "#2d1e0f" }}>
          {flow === "error"
            ? "Error en el pago"
            : pago?.mp_status === "approved"
            ? "¡Pago aprobado!"
            : pago?.mp_status === "rejected"
            ? "Pago rechazado"
            : "Procesando pago"}
        </h2>

        {/* Mensaje */}
        <p className="text-sm mb-5" style={{ color: "#9a8070" }}>
          {flow === "error"
            ? errorMsg || "Ocurrió un error inesperado al procesar el pago."
            : pago?.mp_status === "approved"
            ? `Tu pedido #${pedidoId} ya está confirmado y en preparación.`
            : pago?.mp_status === "rejected"
            ? pago.mp_status_detail || "El pago no pudo ser procesado."
            : errorMsg || "Estamos validando tu pago con MercadoPago. Esto puede tomar unos segundos."}
        </p>

        {/* Detalles */}
        {pago && pago.mp_status !== "pending" && (
          <div className="rounded-xl p-4 mb-5 text-left text-sm space-y-2" style={{ backgroundColor: "#F2E8D5" }}>
            <div className="flex justify-between">
              <span className="text-[#9a8070]">Método</span>
              <span className="font-medium uppercase">{pago.payment_method_id || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9a8070]">Monto</span>
              <span className="font-bold" style={{ color: "#2d1e0f" }}>${Number(pago.transaction_amount).toFixed(2)}</span>
            </div>
            {pago.mp_payment_id && (
              <div className="flex justify-between">
                <span className="text-[#9a8070]">ID Pago</span>
                <span className="font-mono text-xs">{pago.mp_payment_id}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        {flow === "error" ? (
          <div className="space-y-3">
            <button
              onClick={handleReintentar}
              className="w-full bg-[#C87A2E] text-white font-bold py-4 rounded-2xl hover:bg-[#B06920] transition-colors"
            >
              Reintentar pago
            </button>
            <button
              onClick={() => { reset(); onClose(); }}
              className="w-full text-sm text-[#9a8070] py-2 hover:text-[#2d1e0f]"
            >
              Volver
            </button>
          </div>
        ) : pago?.mp_status === "approved" ? (
          <button
            onClick={handleVerPedidos}
            className="w-full bg-[#C87A2E] text-white font-bold py-4 rounded-2xl hover:bg-[#B06920] transition-colors"
          >
            Ver mis pedidos
          </button>
        ) : pago?.mp_status === "rejected" ? (
          intentos < 3 ? (
            <button
              onClick={handleReintentar}
              className="w-full bg-[#C87A2E] text-white font-bold py-4 rounded-2xl hover:bg-[#B06920] transition-colors"
            >
              Reintentar pago ({3 - intentos} intentos restantes)
            </button>
          ) : (
            <div>
              <p className="text-[#2d1e0f] text-sm mb-3">
                Agotaste los reintentos. Probá con otro medio de pago.
              </p>
              <button
                onClick={() => { reset(); onClose(); }}
                className="w-full bg-[#F2E8D5] text-[#2d1e0f] font-bold py-4 rounded-2xl"
              >
                Volver a formas de pago
              </button>
            </div>
          )
        ) : null}
      </div>
    </>
  );
}
