import { ClipboardIcon, CheckCircleIcon, ChefIcon, PackageIcon, XCircleIcon } from "../../../assets/icons/Icons";

type Step = { codigo: string; label: string; Icon: typeof ClipboardIcon };

const TIMELINE_PICKUP: Step[] = [
    { codigo: "PENDIENTE", label: "Pendiente", Icon: ClipboardIcon },
    { codigo: "CONFIRMADO", label: "Confirmado", Icon: CheckCircleIcon },
    { codigo: "EN_PREPARACION", label: "En preparación", Icon: ChefIcon },
    { codigo: "PREPARADO", label: "Preparado", Icon: PackageIcon },
    { codigo: "ENTREGADO", label: "Entregado", Icon: PackageIcon },
];

const TIMELINE_DELIVERY: Step[] = [
    ...TIMELINE_PICKUP.slice(0, 4),
    { codigo: "EN_CAMINO", label: "En camino", Icon: PackageIcon },
    { codigo: "ENTREGADO", label: "Entregado", Icon: PackageIcon },
];

function buildOrden(steps: Step[]): Record<string, number> {
    const map: Record<string, number> = { CANCELADO: -1 };
    steps.forEach((s, i) => { map[s.codigo] = i; });
    return map;
}

interface Props {
    estadoActual: string;
    tipoPedido?: string;
}

export function OrderTimeline({ estadoActual, tipoPedido = "DELIVERY" }: Props) {
    const steps = tipoPedido === "DELIVERY" ? TIMELINE_DELIVERY : TIMELINE_PICKUP;
    const orden = buildOrden(steps);
    const currentIdx = orden[estadoActual] ?? -1;

    if (estadoActual === "CANCELADO") {
        return (
            <div className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircleIcon width={20} height={20} style={{ color: "#dc2626" }} />
                </div>
                <div>
                    <p className="font-bold text-[#e05a3a]">Cancelado</p>
                    <p className="text-xs text-red-500">Este pedido fue cancelado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-3">
            <div className="flex items-center justify-between">
                {steps.map((estado, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                        <div key={estado.codigo} className="relative flex flex-col items-center gap-1 flex-1">
                            {idx < steps.length - 1 && (
                                <div className="absolute h-0.5 w-[calc(100%-2rem)] left-[calc(50%+1rem)] top-5 -z-0 hidden sm:block">
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{
                                            width: isCompleted ? "100%" : "0%",
                                            backgroundColor: isCompleted ? "#2d1e0f" : "#e8ddd5",
                                        }}
                                    />
                                </div>
                            )}

                            <div
                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                                        ? "bg-[#C87A2E] text-white scale-100"
                                        : isCurrent
                                            ? "bg-[#C87A2E] text-white scale-110 ring-4 ring-[#2d1e0f]/30 animate-pulse"
                                            : "bg-[#F2E8D5] text-[#9a8070]"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircleIcon width={18} height={18} />
                                ) : (
                                    <estado.Icon width={18} height={18} />
                                )}
                            </div>

                            <span
                                className={`text-[10px] font-medium text-center leading-tight ${isCompleted
                                        ? "text-[#2d1e0f]"
                                        : isCurrent
                                            ? "text-[#2d1e0f] font-bold"
                                            : "text-[#9a8070]"
                                    }`}
                            >
                                {estado.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
