// src/shared/components/ConfirmModal.tsx
interface Props {
  open: boolean;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmModal({ open, mensaje, onConfirmar, onCancelar }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancelar}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      {/* Card */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 60,
          width: "min(340px, 90vw)",
          background: "#F2E8D5", borderRadius: 24, padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <p className="text-[#2d1e0f] font-medium mb-6">{mensaje}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 bg-[#F2E8D5] text-[#2d1e0f] font-bold py-3 rounded-2xl hover:bg-[#e8ddd5] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-[#e05a3a]/100 text-white font-bold py-3 rounded-2xl hover:bg-[#e05a3a]/80 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
}
