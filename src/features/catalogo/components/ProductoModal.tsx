// src/features/catalogo/components/ProductoModal.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/client";
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
        queryFn: () => apiFetch<Producto>(`/productos/${producto.id}`),
    });

    const { data: ingredientesData } = useQuery({
        queryKey: ["ingredientes"],
        queryFn: () => apiFetch<{ data: Ingrediente[]; total: number }>("/ingredientes/?limit=100"),
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
                width: "min(900px, 95vw)",
                maxHeight: "90vh",
                background: "#fff",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
                display: "flex",
                animation: "modalIn 0.25s ease",
            }}>


                <div style={{ width: "45%", flexShrink: 0, position: "relative" }}>
                    {imagen ? (
                        <img
                            src={imagen}
                            alt={producto.nombre}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{
                            width: "100%", height: "100%", minHeight: 400,
                            background: "#f5ede6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 72,
                        }}>
                            🍽️
                        </div>
                    )}

                    {ingredientesProducto.some((i) => i.es_alergeno) && (
                        <div style={{
                            position: "absolute", bottom: 16, left: 16,
                            background: "rgba(200,114,42,0.9)",
                            color: "#fff", fontSize: 11, fontWeight: 700,
                            padding: "4px 10px", borderRadius: 99,
                            letterSpacing: "0.08em",
                        }}>
                            ⚠️ Contiene alérgenos
                        </div>
                    )}
                </div>


                <div style={{
                    flex: 1, padding: "32px 28px",
                    overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: 20,
                }}>


                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, paddingRight: 16 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#c8722a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Seleccion Premium
                            </p>
                            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#2d1e0f", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
                                {producto.nombre}
                            </h2>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#c8722a" }}>
                                ${precio.toFixed(2)}
                            </p>
                        </div>
                    </div>


                    {producto.descripcion && (
                        <p style={{ margin: 0, fontSize: 14, color: "#7a6a5a", lineHeight: 1.6 }}>
                            {producto.descripcion}
                        </p>
                    )}


                    {ingredientesProducto.length > 0 && (
                        <div>
                            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#9a8070", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Ingredientes
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {ingredientesProducto.map((ing) => {
                                    const activo = !ingredientesQuitados.includes(ing.id);
                                    return (
                                        <div
                                            key={ing.id}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "10px 14px",
                                                background: activo ? "#fdf9f6" : "#f5f5f5",
                                                borderRadius: 12,
                                                border: `1px solid ${activo ? "#e8ddd5" : "#e0e0e0"}`,
                                                transition: "all .15s",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ fontSize: 16 }}>
                                                    {ing.es_alergeno ? "⚠️" : ""}
                                                </span>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: activo ? "#2d1e0f" : "#aaa" }}>
                                                        {ing.nombre}
                                                    </p>
                                                    {ing.es_alergeno && (
                                                        <p style={{ margin: 0, fontSize: 11, color: "#c8722a" }}>Alérgeno</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggleIngrediente(ing.id)}
                                                style={{
                                                    width: 44, height: 24,
                                                    borderRadius: 99,
                                                    border: "none",
                                                    cursor: "pointer",
                                                    background: activo ? "#c8722a" : "#ddd",
                                                    position: "relative",
                                                    transition: "background .2s",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <span style={{
                                                    position: "absolute",
                                                    top: 3, left: activo ? 22 : 3,
                                                    width: 18, height: 18,
                                                    borderRadius: "50%",
                                                    background: "#fff",
                                                    transition: "left .2s",
                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                                }} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    <div style={{ flex: 1 }} />


                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid #f0e8e0" }}>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, border: "1.5px solid #e8ddd5", borderRadius: 99, padding: "8px 16px" }}>
                            <button
                                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 18, color: "#c8722a", lineHeight: 1 }}
                            >−</button>
                            <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: "center" }}>{cantidad}</span>
                            <button
                                onClick={() => setCantidad((c) => c + 1)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 18, color: "#c8722a", lineHeight: 1 }}
                            >+</button>
                        </div>


                        <button
                            onClick={handleAgregar}
                            style={{
                                flex: 1, background: "#c8722a", color: "#fff",
                                border: "none", borderRadius: 16, padding: "14px 20px",
                                fontSize: 14, fontWeight: 800,
                                cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            <span>Añadir y Pagar</span>
                            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 8px" }}>
                                ${totalFinal.toFixed(2)}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 16, right: 16,
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(0,0,0,0.4)", border: "none",
                        color: "#fff", fontSize: 16, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 1,
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