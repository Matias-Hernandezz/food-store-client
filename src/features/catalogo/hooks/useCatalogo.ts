import { useQuery } from "@tanstack/react-query";
import { catalogoApi } from "../api/catalogoApi";
import api from "../../../shared/api/axiosClient";
import type { Ingrediente } from "../../../shared/types";

interface ProductosParams {
  categoria_id?: number;
  search?: string;
  page?: number;
  size?: number;
  precio_min?: number;
  precio_max?: number;
  en_stock?: boolean;
  orden?: string;
}

export function useProductos(params: ProductosParams = {}) {
    return useQuery({
        queryKey: ["productos", params],
        queryFn: () => catalogoApi.getProductos(params),
        refetchInterval: 30_000,  // Refrescar catálogo cada 30s (cambios de stock)
    });
}

export function useProducto(id: number) {
    return useQuery({
        queryKey: ["producto", id],
        queryFn: () => catalogoApi.getProducto(id),
        enabled: !!id,
    });
}

export function useCategorias() {
    return useQuery({
        queryKey: ["categorias"],
        queryFn: () => catalogoApi.getCategorias(),
    });
}
export function useIngredientes() {
    return useQuery({
        queryKey: ["ingredientes"],
        queryFn: () => api.get<{ data: Ingrediente[]; total: number }>("/api/v1/ingredientes/?limit=100").then((r) => r.data),
    });
}