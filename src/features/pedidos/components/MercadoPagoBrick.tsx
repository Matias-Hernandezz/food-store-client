// src/features/pedidos/components/MercadoPagoBrick.tsx
import { useEffect, useRef, useState, useCallback } from "react";

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

    const retry = () => {
        setSdkError(null);
        setSdkReady(false);
        brickRef.current = false;
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
            onError?.("SDK no disponible");
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
    }, [onError, retryKey]);

    // ─── Crear el Brick cuando el SDK está listo ─────────────────────────

    const handleSubmit = useCallback(
        (formData: { token: string; payment_method_id: string; issuer_id: string; installments: number; payer?: { identification?: { type?: string; number?: string } } }) => {
            onSubmit(
                formData.token,
                formData.payment_method_id,
                formData.installments,
                formData.issuer_id,
                formData.payer?.identification?.number,
            );
        },
        [onSubmit]
    );

    useEffect(() => {
        if (!sdkReady || !containerRef.current || brickRef.current) return;

        const mp = new window.MercadoPago!(publicKey);
        const bricks = mp.bricks();

        bricks
            .create("cardPayment", containerRef.current.id, {
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
                    onSubmit: handleSubmit,
                    onReady: () => {
                        brickRef.current = true;
                    },
                    onError: (error) => {
                        // Solo propagar errores criticos — non_critical son normales
                        // (ej: no_payment_method_for_provided_bin mientras se tipea la tarjeta)
                        const err = error as { type?: string; cause?: string; message?: string };
                        if (err.type !== "non_critical") {
                            console.error("Brick error:", err);
                            onError?.("Error en el formulario de pago");
                        }
                    },
                },
            })
            .catch((err: unknown) => {
                console.error("Brick creation failed:", err);
                setSdkError("Error al inicializar el formulario de pago");
                onError?.("Error al inicializar Brick");
            });
    }, [sdkReady, amount, email, publicKey, handleSubmit, onError]);

    // ─── Estados de carga ────────────────────────────────────────────────

    if (sdkError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-bold mb-2">Error</p>
                <p className="text-red-600 text-sm mb-4">{sdkError}</p>
                <button
                    onClick={retry}
                    className="bg-[#c8722a] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#a85e1f] transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!sdkReady) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Cargando formulario de pago seguro...</p>
            </div>
        );
    }

    return (
        <div
            id="mp-brick-container"
            ref={containerRef}
            className="bg-white rounded-2xl p-5 shadow-sm"
        />
    );
}