// src/features/catalogo/components/ProductoCard.tsx
import type { Producto } from "../../../shared/types";
import { getImageUrl } from "../../../shared/utils/imageUrl";
import { getImagenProducto } from "../utils/getImagenProducto";
import { useCarrito } from "../../../store/carritoStore";
import { useUIStore } from "../../../store/uiStore";
import { ShoppingBasketIcon } from "../../../assets/icons/Icons";

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
            className="bg-[#F2E8D5] rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow flex flex-col relative"
            onClick={() => onNavigate(p)}
        >
            {enCarrito && (
                <span className="absolute top-2 right-2 z-10 bg-[#C87A2E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    En carrito
                </span>
            )}
            <div className="w-full h-44 bg-[#F2E8D5] overflow-hidden flex-shrink-0">
                <img src={imagen} alt={p.nombre} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="p-4">
                <div className="mb-3">
                    <p className="font-bold text-[#2d1e0f] text-base truncate">{p.nombre}</p>
                    {p.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>
                    )}
                    <p className="text-[#C87A2E] font-bold text-base mt-2">
                        ${Number(p.precio_base).toLocaleString("es-AR")}
                        {p.unidad_venta?.simbolo && (
                            <span className="text-xs font-normal ml-1" style={{ color: "#9a8070" }}>
                                / {p.cantidad_venta != null ? `${Number(p.cantidad_venta)} ${p.unidad_venta.simbolo}` : p.unidad_venta.simbolo}
                            </span>
                        )}
                    </p>
                    <p className="text-xs mt-1" style={{ color: p.stock_cantidad === 0 ? "#dc2626" : "#9a8070" }}>
                        {p.stock_cantidad > 0 ? `${p.stock_cantidad} en stock` : "Sin stock"}
                    </p>
                </div>
                <button
                    onClick={handleAgregar}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        enCarrito
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-[#C87A2E] text-white hover:bg-[#B06920]"
                    }`}
                >
                    {enCarrito ? (
                        "✓ En carrito"
                    ) : (
                        <>
                            <ShoppingBasketIcon width={16} height={16} className="text-white" />
                            Agregar
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
