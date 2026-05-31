import { apiFetch } from "../../../shared/api/client";
import type { Producto, ProductoList, Categoria } from "../../../shared/types";

export const catalogoApi = {
    getProductos: (offset = 0, limit = 50, categoria_id?: number) => {
        const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
        if (categoria_id) params.set("categoria_id", String(categoria_id));
        return apiFetch<ProductoList>(`/productos/?${params}`);
    },

    getProducto: (id: number) =>
        apiFetch<Producto>(`/productos/${id}`),

    getCategorias: () =>
        apiFetch<{ data: Categoria[]; total: number }>("/categorias/?limit=100"),
};