// src/features/pedidos/components/PagoResultadoModal.tsx
import { usePaymentStore } from "../store/paymentStore";

interface Props {
  onClose: () => void;
}

export function PagoResultadoModal({ onClose }: Props) {
  const pago = usePaymentStore((s) => s.pago);
  const pedidoId = usePaymentStore((s) => s.pedidoId);
  const intentos = usePaymentStore((s) => s.intentos);
  const reset = usePaymentStore((s) => s.reset);
  const retry = usePaymentStore((s) => s.retry);

  const handleVerPedidos = () => {
    reset();
    onClose();
    window.location.href = "/";
  };

  const handleReintentar = () => {
    retry(); // vuelve a awaiting_card manteniendo el pedidoId
  };

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
          background: "#fff", borderRadius: 24, padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        {/* Estado visual */}
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {pago?.mp_status === "approved" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : pago?.mp_status === "rejected" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <div className="w-10 h-10 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold mb-2" style={{ color: "#2d1e0f" }}>
          {pago?.mp_status === "approved"
            ? "¡Pago aprobado!"
            : pago?.mp_status === "rejected"
            ? "Pago rechazado"
            : "Procesando pago"}
        </h2>

        {/* Mensaje */}
        <p className="text-sm mb-5" style={{ color: "#9a8070" }}>
          {pago?.mp_status === "approved"
            ? `Tu pedido #${pedidoId} ya está confirmado y en preparación.`
            : pago?.mp_status === "rejected"
            ? pago.mp_status_detail || "El pago no pudo ser procesado."
            : "Estamos validando tu pago con MercadoPago. Esto puede tomar unos segundos."}
        </p>

        {/* Detalles */}
        {pago && pago.mp_status !== "pending" && (
          <div className="rounded-xl p-4 mb-5 text-left text-sm space-y-2" style={{ backgroundColor: "#fdf9f6" }}>
            <div className="flex justify-between">
              <span className="text-gray-500">Método</span>
              <span className="font-medium uppercase">{pago.payment_method_id || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monto</span>
              <span className="font-bold" style={{ color: "#c8722a" }}>${Number(pago.transaction_amount).toFixed(2)}</span>
            </div>
            {pago.mp_payment_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">ID Pago</span>
                <span className="font-mono text-xs">{pago.mp_payment_id}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        {pago?.mp_status === "approved" ? (
          <button
            onClick={handleVerPedidos}
            className="w-full bg-[#c8722a] text-white font-bold py-4 rounded-2xl hover:bg-[#a85e1f] transition-colors"
          >
            Ver mis pedidos
          </button>
        ) : pago?.mp_status === "rejected" ? (
          intentos < 3 ? (
            <button
              onClick={handleReintentar}
              className="w-full bg-[#c8722a] text-white font-bold py-4 rounded-2xl hover:bg-[#a85e1f] transition-colors"
            >
              Reintentar pago ({3 - intentos} intentos restantes)
            </button>
          ) : (
            <div>
              <p className="text-amber-800 text-sm mb-3">
                Agotaste los reintentos. Probá con otro medio de pago.
              </p>
              <button
                onClick={() => { reset(); onClose(); }}
                className="w-full bg-[#2d1e0f] text-white font-bold py-4 rounded-2xl"
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
