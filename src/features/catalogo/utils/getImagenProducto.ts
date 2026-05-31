// src/features/catalogo/utils/getImagenProducto.ts
import { imageUrl } from "../../../shared/utils/imageUrl";
import type { Producto } from "../../../shared/types";

const IMAGEN_POR_CATEGORIA: Record<string, string> = {
    "almuerzo": "/almuerzos-generales.jpg",
    "bebida": "/bebidas-generales.png",
    "cena": "/cena.jpg",
    "desayuno": "/desayuno-generales.jpg",
    "merienda": "/mediatarde.jpg",
    "mediatarde": "/mediatarde.jpg",
    "snack": "/snacks-generales.jpg",
    "americana": "/americana.jpg",
};

export const getImagenProducto = (
    p: Producto,
    categorias: { id: number; nombre: string }[]
): string => {
    if (p.imagenes_url) return imageUrl(p.imagenes_url) ?? "/comidas-general.png";
    for (const id of (p.categoria_ids ?? [])) {
        const cat = categorias.find((c) => c.id === id);
        if (cat) {
            const key = cat.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const match = Object.keys(IMAGEN_POR_CATEGORIA).find((k) => key.includes(k));
            if (match) return IMAGEN_POR_CATEGORIA[match];
        }
    }
    return "/comidas-general.png";
};