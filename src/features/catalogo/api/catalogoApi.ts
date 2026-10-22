import api from "../../../shared/api/axiosClient";
import { USE_PUBLIC_API } from "../../../shared/config/storeConfig";
import { mapPublicProducto, publicApi } from "../../public/api/publicApi";
import type { Producto, ProductoList, Categoria } from "../../../shared/types";

let catalogoPublicCache: { productos: Producto[]; categorias: Categoria[] } | null = null;

async function loadPublicCatalogo() {
    if (!catalogoPublicCache) {
        const raw = await publicApi.getCatalogo();
        catalogoPublicCache = {
            categorias: raw.categorias,
            productos: raw.productos.map(mapPublicProducto),
        };
    }
    return catalogoPublicCache;
}

export function invalidatePublicCatalogoCache() {
    catalogoPublicCache = null;
}

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
        if (USE_PUBLIC_API) {
            return loadPublicCatalogo().then(({ productos }) => {
            let filtered = [...productos];
            if (params.categoria_id) {
                filtered = filtered.filter((p) => p.categoria_ids.includes(params.categoria_id!));
            }
            if (params.search) {
                const q = params.search.toLowerCase();
                filtered = filtered.filter(
                    (p) =>
                        p.nombre.toLowerCase().includes(q) ||
                        (p.descripcion ?? "").toLowerCase().includes(q),
                );
            }
            if (params.en_stock) {
                filtered = filtered.filter((p) => p.disponible && p.stock_cantidad > 0);
            }
            if (params.precio_min !== undefined) {
                filtered = filtered.filter((p) => Number(p.precio_base) >= params.precio_min!);
            }
            if (params.precio_max !== undefined) {
                filtered = filtered.filter((p) => Number(p.precio_base) <= params.precio_max!);
            }
            if (params.orden === "precio_asc") {
                filtered.sort((a, b) => Number(a.precio_base) - Number(b.precio_base));
            } else if (params.orden === "precio_desc") {
                filtered.sort((a, b) => Number(b.precio_base) - Number(a.precio_base));
            }
            return { data: filtered, total: filtered.length } satisfies ProductoList;
            });
        }

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

    getProducto: async (id: number) => {
        if (USE_PUBLIC_API) {
            const { productos } = await loadPublicCatalogo();
            const found = productos.find((p) => p.id === id);
            if (!found) throw new Error("Producto no encontrado");
            return found;
        }
        return api.get<Producto>(`/api/v1/productos/${id}`).then((r) => r.data);
    },

    getCategorias: async () => {
        if (USE_PUBLIC_API) {
            const { categorias } = await loadPublicCatalogo();
            return { data: categorias, total: categorias.length };
        }
        return api.get<{ data: Categoria[]; total: number }>("/api/v1/categorias/?limit=100").then((r) => r.data);
    },
};
