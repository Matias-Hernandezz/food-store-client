// src/features/usuarios/components/PerfilModal.tsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { UserIcon, ReceiptIcon, LogoutIcon } from "../../../assets/icons/Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenPedidos?: () => void;
}

export function PerfilModal({ open, onClose, onOpenPedidos }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!open || !user) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/");
  };

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

      {/* Card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 60,
          width: "min(360px, 90vw)",
          background: "#F2E8D5",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#F2E8D5",
            border: "none",
            borderRadius: 12,
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 16,
            color: "#2d1e0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Avatar + Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#F2E8D5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UserIcon width={26} height={26} style={{ color: "#2d1e0f" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#2d1e0f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.nombre} {user.apellido}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9a8070", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Roles */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {user.roles.map((rol) => (
            <span
              key={rol}
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                background: rol === "ADMIN" ? "rgba(239,159,39,0.1)" : "#F2E8D5",
                color: rol === "ADMIN" ? "#2d1e0f" : "#9a8070",
                padding: "4px 10px",
                borderRadius: 99,
              }}
            >
              {rol}
            </span>
          ))}
        </div>

        {/* Mis Pedidos */}
        <button
          onClick={() => { onClose(); onOpenPedidos?.(); }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F2E8D5",
            border: "1.5px solid #e8ddd5",
            borderRadius: 14,
            padding: "14px 18px",
            cursor: "pointer",
            marginBottom: 16,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2d1e0f"; e.currentTarget.style.background = "rgba(239,159,39,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8ddd5"; e.currentTarget.style.background = "#F2E8D5"; }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14, color: "#2d1e0f" }}>
            <ReceiptIcon width={18} height={18} style={{ color: "#2d1e0f" }} />
            Mis Pedidos
          </span>
          <span style={{ color: "#d4b5a0", fontSize: 16 }}>→</span>
        </button>

        {/* Cerrar Sesión */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "rgba(224,90,58,0.06)",
            border: "1.5px solid rgba(224,90,58,0.15)",
            borderRadius: 14,
            padding: "14px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            color: "#e05a3a",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(224,90,58,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(224,90,58,0.06)"; }}
        >
          <LogoutIcon width={16} height={16} style={{ color: "#e05a3a" }} />
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}
