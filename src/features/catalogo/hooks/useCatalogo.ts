import { useQuery } from "@tanstack/react-query";
import { catalogoApi } from "../api/catalogoApi";
import { apiFetch } from "../../../shared/api/client";
import type { Ingrediente } from "../../../shared/types";

export function useProductos(categoria_id?: number) {
    return useQuery({
        queryKey: ["productos", categoria_id],
        queryFn: () => catalogoApi.getProductos(0, 50, categoria_id),
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
        queryFn: () => apiFetch<{ data: Ingrediente[]; total: number }>("/ingredientes/?limit=100"),
    });
}