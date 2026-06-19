// src/features/catalogo/components/ProductoCard.tsx
import type { Producto } from "../../../shared/types";
import { getImageUrl } from "../../../shared/utils/imageUrl";
import { getImagenProducto } from "../utils/getImagenProducto";
import { useCarrito } from "../../carrito/store/carritoStore";
import { useUIStore } from "../../../store/uiStore";

interface ProductoCardProps {
    p: Producto;
    onAgregar: (p: Producto) => void;
    onNavigate: (p: Producto) => void;
    categorias: { id: number; nombre: string }[];
}

export const ProductoCard = ({ p, onAgregar, onNavigate, categorias }: ProductoCardProps) => {
    const enCarrito = useCarrito((s) => s.items.some((i) => i.producto_id === p.id));
    const addToast = useUIStore((s) => s.addToast);

    const imagen =
        p.imagenes_url && p.imagenes_url.length > 0
            ? getImageUrl(p.imagenes_url[0], 400, 300)
            : getImagenProducto(p, categorias);

    const handleAgregar = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAgregar(p);
        addToast({ type: "success", message: `${p.nombre} agregado al carrito` });
    };

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col relative"
            onClick={() => onNavigate(p)}
        >
            {enCarrito && (
                <span className="absolute top-2 right-2 z-10 bg-[#c8722a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    En carrito
                </span>
            )}
            <div className="w-full h-44 bg-gray-100 overflow-hidden flex-shrink-0">
                <img src={imagen} alt={p.nombre} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4 flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2d1e0f] text-base truncate">{p.nombre}</p>
                    {p.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>
                    )}
                    <p className="text-[#c8722a] font-bold text-base mt-2">
                        ${Number(p.precio_base).toLocaleString("es-AR")}
                    </p>
                </div>
                <button
                    onClick={handleAgregar}
                    className="w-10 h-10 bg-[#c8722a] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 hover:bg-[#a85e1f] transition-colors text-lg"
                >+</button>
            </div>
        </div>
    );
};
