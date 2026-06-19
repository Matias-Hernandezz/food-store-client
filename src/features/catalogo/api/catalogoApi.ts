import api from "../../../shared/api/axiosClient";
import type { Producto, ProductoList, Categoria } from "../../../shared/types";

export const catalogoApi = {
    getProductos: (offset = 0, limit = 50, categoria_id?: number, search?: string) => {
        const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
        if (categoria_id) params.set("categoria_id", String(categoria_id));
        if (search) params.set("search", search);
        return api.get<ProductoList>(`/api/v1/productos/?${params}`).then((r) => r.data);
    },

    getProducto: (id: number) =>
        api.get<Producto>(`/api/v1/productos/${id}`).then((r) => r.data),

    getCategorias: () =>
        api.get<{ data: Categoria[]; total: number }>("/api/v1/categorias/?limit=100").then((r) => r.data),
};
