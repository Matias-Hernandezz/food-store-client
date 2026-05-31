// src/features/catalogo/components/ProductoCard.tsx
import type { Producto } from "../../../shared/types";
import { getImagenProducto } from "../utils/getImagenProducto";

interface ProductoCardProps {
    p: Producto;
    onAgregar: (p: Producto) => void;
    onNavigate: (p: Producto) => void;
    categorias: { id: number; nombre: string }[];
}

export const ProductoCard = ({ p, onAgregar, onNavigate, categorias }: ProductoCardProps) => {
    const imagen = getImagenProducto(p, categorias);

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            onClick={() => onNavigate(p)}
        >
            {/* Imagen grande arriba */}
            <div className="w-full h-44 bg-gray-100 overflow-hidden flex-shrink-0">
                <img src={imagen} alt={p.nombre} className="w-full h-full object-cover" />
            </div>
            {/* Info abajo */}
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
                    onClick={(e) => { e.stopPropagation(); onAgregar(p); }}
                    className="w-10 h-10 bg-[#c8722a] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 hover:bg-[#a85e1f] transition-colors text-lg"
                >+</button>
            </div>
        </div>
    );
};