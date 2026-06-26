import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidosApi";
import type { DireccionCreate, PedidoCreate } from "../../../shared/types";

export const ESTADO_LABEL: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    EN_PREP: "En Preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

export const ESTADO_COLOR: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    CONFIRMADO: "bg-blue-100 text-blue-800",
    EN_PREP: "bg-orange-100 text-orange-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
};

interface Props {
    enabled?: boolean;
}

export function usePedidos({ enabled = true }: Props = {}) {
    const queryClient = useQueryClient();

    // --- QUERIES ---
    const misPedidosQuery = useQuery({
        queryKey: ["mis-pedidos"],
        queryFn: () => pedidosApi.getMisPedidos(),
        enabled,
    });

    const formasPagoQuery = useQuery({
        queryKey: ["formas-pago"],
        queryFn: () => pedidosApi.getFormasPago(),
        enabled,
    });

    const direccionesQuery = useQuery({
        queryKey: ["direcciones"],
        queryFn: () => pedidosApi.getDirecciones(),
        enabled,
    });

    // --- MUTATIONS ---
    const crearDireccion = useMutation({
        mutationFn: (data: DireccionCreate) => pedidosApi.crearDireccion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["direcciones"] });
        },
    });

    const eliminarDireccion = useMutation({
        mutationFn: (id: number) => pedidosApi.deleteDireccion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["direcciones"] });
        },
    });

    const crearPedido = useMutation({
        mutationFn: (data: PedidoCreate) => pedidosApi.crear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
        },
    });

    const crearPago = useMutation({
        mutationFn: (data: {
            pedido_id: number;
            token: string;
            payment_method_id: string;
            installments: number;
            issuer_id?: string;
            dni_number?: string;
        }) => pedidosApi.crearPago(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
        },
    });

    return {
        data: misPedidosQuery.data,
        isLoading: misPedidosQuery.isLoading,
        isFetching: misPedidosQuery.isFetching,
        isError: misPedidosQuery.isError,
        refetch: misPedidosQuery.refetch,
        formasPago: formasPagoQuery.data,
        formasPagoLoading: formasPagoQuery.isLoading,
        direcciones: direccionesQuery.data,
        direccionesLoading: direccionesQuery.isLoading,
        crearDireccion,
        eliminarDireccion,
        crearPedido,
        crearPago,
    };
}
