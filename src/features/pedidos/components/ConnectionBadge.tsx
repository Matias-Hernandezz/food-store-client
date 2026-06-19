// src/features/pedidos/components/ConnectionBadge.tsx
import { useWSStore } from "../store/wsStore";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    connected: { color: "#22c55e", label: "En vivo" },
    connecting: { color: "#eab308", label: "Conectando..." },
    disconnected: { color: "#9ca3af", label: "Sin conexión en tiempo real" },
    error: { color: "#ef4444", label: "Error de conexión" },
};

export function ConnectionBadge() {
    const status = useWSStore((s) => s.status);
    const reconnectAttempt = useWSStore((s) => s.reconnectAttempt);

    const config = STATUS_CONFIG[status];
    const showRetry = status === "connecting" && reconnectAttempt > 0;

    return (
        <div className="flex items-center gap-1.5">
            <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-gray-500">
                {config.label}
                {showRetry && ` (intento ${reconnectAttempt})`}
            </span>
        </div>
    );
}
