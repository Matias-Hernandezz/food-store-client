// src/features/catalogo/utils/getImagenProducto.ts
import { imageUrl } from "../../../shared/utils/imageUrl";
import type { Producto } from "../../../shared/types";

/** Genera un placeholder SVG con la inicial de una categoría. */
const placeholderImg = (label: string): string => {
    const color = "#c8722a";
    const initial = label.charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="${color}" opacity="0.15"/>
        <text x="200" y="170" text-anchor="middle" fill="${color}" font-size="48" font-family="sans-serif" font-weight="bold">${initial}</text>
        <text x="200" y="210" text-anchor="middle" fill="${color}" font-size="14" font-family="sans-serif" opacity="0.6">${label}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const getImagenProducto = (
    p: Producto,
    categorias: { id: number; nombre: string }[]
): string => {
    // Si el producto tiene imágenes de Cloudinary, usar la primera
    if (p.imagenes_url && p.imagenes_url.length > 0) {
        return imageUrl(p.imagenes_url[0]) ?? placeholderImg(p.nombre);
    }

    // Buscar la categoría para generar un placeholder contextual
    for (const id of (p.categoria_ids ?? [])) {
        const cat = categorias.find((c) => c.id === id);
        if (cat) return placeholderImg(cat.nombre);
    }

    return placeholderImg(p.nombre);
};
