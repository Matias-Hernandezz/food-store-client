import { useQuery } from "@tanstack/react-query";
import { catalogoApi } from "../api/catalogoApi";
import api from "../../../shared/api/axiosClient";
import type { Ingrediente } from "../../../shared/types";

export function useProductos(categoria_id?: number, search?: string, limit = 50) {
    return useQuery({
        queryKey: ["productos", categoria_id, search, limit],
        queryFn: () => catalogoApi.getProductos(0, limit, categoria_id, search),
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