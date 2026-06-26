import { useQuery } from "@tanstack/react-query";
import { catalogoApi } from "../api/catalogoApi";
import api from "../../../shared/api/axiosClient";
import type { Ingrediente } from "../../../shared/types";

interface Props {
  id?: number;
  page?: number;
  pageSize?: number;
  categoria?: number;
  search?: string;
  precio_min?: number;
  precio_max?: number;
  en_stock?: boolean;
  orden?: string;
  enabled?: boolean;
}

export function useCatalogo({
  id,
  page = 1,
  pageSize = 100,
  categoria,
  search,
  precio_min,
  precio_max,
  en_stock,
  orden,
  enabled = true,
}: Props = {}) {
  const productosParams = { categoria_id: categoria, search, page, size: pageSize, precio_min, precio_max, en_stock, orden };

  const productosList = useQuery({
    queryKey: ["productos", productosParams],
    queryFn: () => catalogoApi.getProductos(productosParams),
    refetchInterval: 30_000,
    enabled: enabled && !id,
  });

  const productoById = useQuery({
    queryKey: ["producto", id],
    queryFn: () => id ? catalogoApi.getProducto(id) : Promise.reject("No ID provided"),
    enabled: enabled && !!id,
  });

  const categoriasQuery = useQuery({
    queryKey: ["categorias"],
    queryFn: () => catalogoApi.getCategorias(),
    enabled: enabled && !id,
  });

  const ingredientesQuery = useQuery({
    queryKey: ["ingredientes"],
    queryFn: () => api.get<{ data: Ingrediente[]; total: number }>("/api/v1/ingredientes/?limit=100").then((r) => r.data),
    enabled,
  });

  return {
    data: productosList.data,
    singleData: productoById.data,
    isLoading: productosList.isLoading || productoById.isLoading,
    isFetching: productosList.isFetching || productoById.isFetching,
    isError: productosList.isError || productoById.isError,
    refetch: productosList.refetch,
    refetchById: productoById.refetch,
    categorias: categoriasQuery.data,
    categoriasLoading: categoriasQuery.isLoading,
    ingredientes: ingredientesQuery.data,
    ingredientesLoading: ingredientesQuery.isLoading,
  };
}
