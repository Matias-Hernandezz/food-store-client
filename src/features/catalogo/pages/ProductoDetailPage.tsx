// src/features/catalogo/pages/ProductoDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProducto } from "../hooks/useCatalogo";
import { useCarrito } from "../../../store/carritoStore";
import { imageUrl } from "../../../shared/utils/imageUrl";
import { MealIcon } from "../../../assets/icons/Icons";

export function ProductoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: producto, isLoading } = useProducto(Number(id));
    const { agregar } = useCarrito();
    const [cantidad, setCantidad] = useState(1);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8D5C0" }}>
                <div className="w-8 h-8 border-2 border-[#2d1e0f] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!producto) return null;

    const precio = Number(producto.precio_base);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#E8D5C0" }}>
            {/* Header */}
            <div className="relative">
                <div className="h-64 bg-[#e8ddd5] overflow-hidden">
                    {imageUrl(producto.imagenes_url) ? (
                        <img src={imageUrl(producto.imagenes_url)!} alt={producto.nombre} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><MealIcon width={64} height={64} style={{ color: "#2d1e0f", opacity: 0.4 }} /></div>
                    )}
                </div>
                <button onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-[#F2E8D5]/90 rounded-full flex items-center justify-center shadow-md">
                    ←
                </button>
            </div>

            {/* Info */}
            <div className="bg-[#F2E8D5] rounded-t-3xl -mt-6 relative px-6 pt-8 pb-32">
                {producto.categoria && (
                    <p className="text-xs font-bold text-[#2d1e0f] uppercase tracking-widest mb-2">
                        {producto.categoria.nombre}
                    </p>
                )}
                <h1 className="text-3xl font-black text-[#2d1e0f] mb-2" style={{ fontFamily: "Georgia, serif" }}>
                    {producto.nombre}
                </h1>
                <p className="text-2xl font-bold text-[#2d1e0f] text-right mb-4">

                    {precio.toFixed(2)} ARS

                    <span className="text-xs font-normal text-[#9a8070] ml-1">IVA incluido</span>
                </p>

                {producto.descripcion && (
                    <>
                        <h2 className="font-bold text-[#2d1e0f] text-lg mb-2">Descripción</h2>
                        <p className="text-[#2d1e0f] text-sm leading-relaxed mb-6">{producto.descripcion}</p>
                    </>
                )}

                <div className="bg-orange-50 rounded-2xl p-4">
                    <p className="text-sm font-bold text-[#2d1e0f] mb-1">⚠️ Alérgenos</p>
                    <p className="text-xs text-[#9a8070]">
                        Por favor, informá a nuestro personal sobre cualquier alergia antes de confirmar tu pedido.
                    </p>
                </div>
            </div>

            {/* Footer fijo */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#F2E8D5] border-t border-gray-200 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 border border-gray-200 rounded-full px-4 py-2">
                    <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="text-[#2d1e0f] font-bold">−</button>
                    <span className="font-bold">{cantidad}</span>
                    <button onClick={() => setCantidad((c) => c + 1)} className="text-[#2d1e0f] font-bold">+</button>
                </div>
                <button
                    onClick={() => {
                        agregar({
                            producto_id: producto.id,
                            nombre: producto.nombre,
                            precio,
                            imagen_url: imageUrl(producto.imagenes_url),
                            cantidad,
                        });
                        navigate("/");
                    }}
                    className="flex-1 ml-4 bg-[#C87A2E] hover:bg-[#B06920] text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
                >
                    Añadir al Carrito · ${precio.toFixed(2)}
                </button>
            </div>
        </div>
    );
}