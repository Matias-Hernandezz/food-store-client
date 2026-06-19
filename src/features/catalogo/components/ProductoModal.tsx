// src/features/catalogo/components/ProductoModal.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../shared/api/axiosClient";
import { MealIcon } from "../../../assets/icons/Icons";
import { imageUrl } from "../../../shared/utils/imageUrl";
import { useCarrito } from "../../carrito/store/carritoStore";
import type { Producto, Ingrediente } from "../../../shared/types";

interface Props {
    producto: Producto;
    onClose: () => void;
}

export function ProductoModal({ producto, onClose }: Props) {
    const { agregar } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const [ingredientesQuitados, setIngredientesQuitados] = useState<number[]>([]);
    const { data: productoCompleto } = useQuery({
        queryKey: ["producto", producto.id],
        queryFn: () => api.get<Producto>(`/api/v1/productos/${producto.id}`).then((r) => r.data),
    });

    const { data: ingredientesData } = useQuery({
        queryKey: ["ingredientes"],
        queryFn: () => api.get<{ data: Ingrediente[]; total: number }>("/api/v1/ingredientes/?limit=100").then((r) => r.data),
    });

    const todosIngredientes = ingredientesData?.data ?? [];
    const ingredientesProducto = todosIngredientes.filter((i) =>
        productoCompleto?.ingrediente_ids?.includes(i.id)
    );

    const toggleIngrediente = (id: number) => {
        setIngredientesQuitados((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const precio = Number(producto.precio_base);
    const totalFinal = precio * cantidad;

    const handleAgregar = () => {
        agregar({
            producto_id: producto.id,
            nombre: producto.nombre,
            precio,
            imagen_url: imageUrl(producto.imagenes_url),
            cantidad,
            personalizacion: ingredientesQuitados,
        });
        onClose();
    };

    const imagen = imageUrl(producto.imagenes_url);

    return (
        <>

            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 30,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                }}
            />


            <div style={{
                position: "fixed",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 40,
                width: "min(650px, 95vw)",
                maxHeight: "90vh",
                background: "#fff",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                animation: "modalIn 0.25s ease",
            }}>

                {/* ── Imagen grande arriba ──────────────────────────── */}
                <div style={{ width: "100%", height: 260, flexShrink: 0, position: "relative", background: "#f5ede6", overflow: "hidden" }}>
                    {imagen ? (
                        <img
                            src={imagen}
                            alt={producto.nombre}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                        />
                    ) : (
                        <div style={{
                            width: "100%", height: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <MealIcon width={80} height={80} style={{ color: "#c8722a", opacity: 0.4 }} />
                        </div>
                    )}
                    {ingredientesProducto.some((i) => i.es_alergeno) && (
                        <div style={{
                            position: "absolute", bottom: 12, left: 12,
                            background: "rgba(200,114,42,0.9)",
                            color: "#fff", fontSize: 11, fontWeight: 700,
                            padding: "4px 10px", borderRadius: 99,
                        }}>⚠️ Contiene alérgenos</div>
                    )}
                </div>

                {/* ── Info + ingredientes abajo ──────────────────────── */}
                <div style={{
                    padding: "24px",
                    overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: 14,
                }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#2d1e0f", fontFamily: "Georgia, serif" }}>
                                {producto.nombre}
                            </h2>
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#c8722a", whiteSpace: "nowrap" }}>
                            ${precio.toFixed(2)}
                        </span>
                    </div>

                    {producto.descripcion && (
                        <p style={{ margin: 0, fontSize: 13, color: "#7a6a5a", lineHeight: 1.5 }}>
                            {producto.descripcion}
                        </p>
                    )}

                    {/* ── Ingredientes en chips ──────────────────────── */}
                    {ingredientesProducto.length > 0 && (
                        <div>
                            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, color: "#9a8070", textTransform: "uppercase" }}>
                                Ingredientes
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {ingredientesProducto.map((ing) => {
                                    const activo = !ingredientesQuitados.includes(ing.id);
                                    return (
                                        <button
                                            key={ing.id}
                                            onClick={() => toggleIngrediente(ing.id)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                padding: "5px 10px", borderRadius: 99,
                                                border: activo ? "1.5px solid #c8722a" : "1.5px solid #e0e0e0",
                                                background: activo ? "#fdf9f6" : "#f9f9f9",
                                                cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                color: activo ? "#2d1e0f" : "#aaa",
                                                textDecoration: activo ? "none" : "line-through",
                                            }}
                                        >
                                            {ing.es_alergeno && <span style={{ fontSize: 11 }}>⚠️</span>}
                                            {ing.nombre}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Footer ──────────────────────────────────────── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid #f0e8e0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e8ddd5", borderRadius: 99, padding: "6px 14px" }}>
                            <button onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#c8722a" }}>−</button>
                            <span style={{ fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: "center" }}>{cantidad}</span>
                            <button onClick={() => setCantidad((c) => c + 1)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#c8722a" }}>+</button>
                        </div>
                        <button onClick={handleAgregar}
                            style={{
                                flex: 1, background: "#c8722a", color: "#fff",
                                border: "none", borderRadius: 14, padding: "12px 18px",
                                fontSize: 13, fontWeight: 800,
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 8,
                            }}>
                            <span>Añadir y Pagar</span>
                            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 6px", fontSize: 12 }}>
                                ${totalFinal.toFixed(2)}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 12, right: 12,
                        width: 30, height: 30, borderRadius: "50%",
                        background: "rgba(0,0,0,0.45)", border: "none",
                        color: "#fff", fontSize: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 2,
                    }}
                >✕</button>
            </div>

            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
        </>
    );
}