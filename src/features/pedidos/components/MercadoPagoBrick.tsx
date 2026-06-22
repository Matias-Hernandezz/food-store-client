// src/features/pedidos/components/MercadoPagoBrick.tsx
import { useEffect, useRef, useState, useId } from "react";

declare global {
    interface Window {
        MercadoPago?: {
            new(publicKey: string): {
                bricks: () => {
                    create: (
                        type: "cardPayment",
                        containerId: string,
                        config: BrickConfig
                    ) => Promise<void>;
                };
            };
        };
    }
}

interface BrickConfig {
    initialization: {
        amount: number;
        payer?: { email?: string };
    };
    customization?: {
        visual?: {
            style?: { theme?: "default" | "bootstrap" | "dark" };
            hidePaymentButton?: boolean;
        };
        paymentMethods?: {
            maxInstallments?: number;
        };
    };
    callbacks: {
        onSubmit: (formData: {
            token: string;
            payment_method_id: string;
            issuer_id: string;
            installments: number;
            payer?: {
                identification?: {
                    type?: string;
                    number?: string;
                };
            };
        }) => void;
        onReady?: () => void;
        onError?: (error: unknown) => void;
    };
}

interface Props {
    amount: number;
    email?: string;
    publicKey: string;
    onSubmit: (token: string, paymentMethodId: string, installments: number, issuerId: string, dniNumber?: string) => void;
    onError?: (error: string) => void;
}

export function MercadoPagoBrick({ amount, email, publicKey, onSubmit, onError }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);
    const brickRef = useRef<boolean>(false);
    const [retryKey, setRetryKey] = useState(0);
    const [brickError, setBrickError] = useState<string | null>(null);
    const brickId = `mp-brick-${useId().replace(/:/g, "")}`;

    // ─── Refs estables para los callbacks ──────────────────────────────
    // Evitan que el efecto de creación del Brick se vuelva a disparar
    // cada vez que el padre re-renderiza y pasa una función nueva.
    const onSubmitRef = useRef(onSubmit);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onSubmitRef.current = onSubmit;
        onErrorRef.current = onError;
    }, [onSubmit, onError]);

    const retry = () => {
        setSdkError(null);
        setSdkReady(false);
        brickRef.current = false;
        setBrickError(null);
        setRetryKey((k) => k + 1);
    };

    // ─── Cargar SDK de MP dinámicamente (con timeout) ──────────────────

    useEffect(() => {
        // Si ya está cargado (por el preload del index.html o instancia previa)
        if (window.MercadoPago) {
            setSdkReady(true);
            return;
        }

        let timeout: ReturnType<typeof setTimeout>;
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;

        script.onload = () => {
            clearTimeout(timeout);
            setSdkReady(true);
        };
        script.onerror = () => {
            clearTimeout(timeout);
            setSdkError("No se pudo cargar el SDK de MercadoPago");
            onErrorRef.current?.("SDK no disponible");
        };

        // Timeout: si en 15s no cargó, mostrar error con reintento
        timeout = setTimeout(() => {
            if (!window.MercadoPago) {
                script.remove();
                setSdkError("El SDK tardó demasiado en cargar. Revisá tu conexión.");
            }
        }, 15000);

        document.body.appendChild(script);

        return () => {
            clearTimeout(timeout);
        };
    }, [retryKey]);

    // ─── Crear el Brick cuando el SDK está listo ─────────────────────────
    // Ojo: las dependencias NO incluyen onSubmit/onError directamente,
    // sino que se accede a través de los refs (onSubmitRef/onErrorRef).
    // Así el Brick se crea una sola vez por montaje, sin re-crearse
    // en cada render del padre.

    useEffect(() => {
        if (!sdkReady || !containerRef.current || brickRef.current) return;
        if (!amount || amount <= 0) return;

        let controller: any;

        const mp = new window.MercadoPago!(publicKey);
        const bricks = mp.bricks();

        bricks
            .create("cardPayment", brickId, {
                initialization: {
                    amount,
                    payer: email ? { email } : undefined,
                },
                customization: {
                    visual: {
                        style: { theme: "default" },
                        hidePaymentButton: false,
                    },
                    paymentMethods: {
                        maxInstallments: 6,
                    },
                },
                callbacks: {
                    onSubmit: (formData) => {
                        onSubmitRef.current(
                            formData.token,
                            formData.payment_method_id,
                            formData.installments,
                            formData.issuer_id,
                            formData.payer?.identification?.number,
                        );
                    },
                    onReady: () => {
                        brickRef.current = true;
                    },
                    onError: (error) => {
                        const err = error as { type?: string; cause?: string; message?: string };
                        // Mostrar todos los errores, no filtrar non_critical
                        const msg = err.cause || err.message || "Error en el formulario de pago";
                        if (err.type !== "non_critical") {
                            console.error("Brick error:", err);
                            setBrickError(msg);
                            onErrorRef.current?.(msg);
                        }
                    },
                },
            })
            .then((c) => {
                controller = c;
            })
            .catch((err: unknown) => {
                console.error("Brick creation failed:", err);
                setSdkError("Error al inicializar el formulario de pago");
                onErrorRef.current?.("Error al inicializar Brick");
            });

        return () => {
            controller?.unmount();
            brickRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sdkReady, amount, email, publicKey, brickId]);

    // ─── Estados de carga ────────────────────────────────────────────────

    if (sdkError) {
        return (
            <div className="bg-[#e05a3a]/10 border border-[#e05a3a]/30 rounded-xl p-6 text-center">
                <p className="text-[#e05a3a] font-bold mb-2">Error</p>
                <p className="text-[#e05a3a] text-sm mb-4">{sdkError}</p>
                <button
                    onClick={retry}
                    className="bg-[#C87A2E] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#B06920] transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!sdkReady) {
        return (
            <div className="bg-[#F2E8D5] rounded-2xl p-8 shadow-sm flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#9a8070]">Cargando formulario de pago seguro...</p>
            </div>
        );
    }

    return (
        <>
            {brickError && (
                <div className="bg-[#e05a3a]/10 border border-[#e05a3a]/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <span className="text-red-500 text-lg mt-0.5">⚠</span>
                    <div className="flex-1">
                        <p className="text-[#e05a3a] font-bold text-sm mb-1">Error del formulario</p>
                        <p className="text-[#e05a3a] text-xs">{brickError}</p>
                        <button
                            onClick={retry}
                            className="mt-2 text-xs font-bold text-[#e05a3a] underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            )}
            <div
                id={brickId}
                ref={containerRef}
                className="bg-[#F2E8D5] rounded-2xl p-5 shadow-sm"
            />
        </>
    );
}