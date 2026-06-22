import api from "../../../shared/api/axiosClient";
import type { Producto, ProductoList, Categoria } from "../../../shared/types";

export const catalogoApi = {
    getProductos: (params: {
        page?: number;
        size?: number;
        categoria_id?: number;
        search?: string;
        precio_min?: number;
        precio_max?: number;
        en_stock?: boolean;
        orden?: string;
    } = {}) => {
        const p = new URLSearchParams({
            page: String(params.page ?? 1),
            size: String(params.size ?? 100),
        });
        if (params.categoria_id) p.set("categoria", String(params.categoria_id));
        if (params.search) p.set("search", params.search);
        if (params.precio_min !== undefined) p.set("precio_min", String(params.precio_min));
        if (params.precio_max !== undefined) p.set("precio_max", String(params.precio_max));
        if (params.en_stock) p.set("en_stock", "true");
        if (params.orden) p.set("orden", params.orden);
        return api.get<ProductoList>(`/api/v1/productos/?${p}`).then((r) => r.data);
    },

    getProducto: (id: number) =>
        api.get<Producto>(`/api/v1/productos/${id}`).then((r) => r.data),

    getCategorias: () =>
        api.get<{ data: Categoria[]; total: number }>("/api/v1/categorias/?limit=100").then((r) => r.data),
};
