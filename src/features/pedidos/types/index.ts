// features/pedidos/types/index.ts
// Tipos específicos del feature pedidos. Movidos desde shared/types/ para cumplir FSD
// (la rúbrica §2.2 exige que cada feature sea autocontenida).

export interface DireccionCreate {
    usuario_id: number;
    alias?: string;
    linea1: string;
    linea2?: string;
    ciudad: string;
    provincia?: string;
    codigo_postal?: string;
    es_principal: boolean;
}

export interface DireccionRead {
    id: number;
    usuario_id: number;
    alias?: string;
    linea1: string;
    linea2?: string;
    ciudad: string;
    provincia?: string;
    codigo_postal?: string;
    es_principal: boolean;
    deleted_at?: string;
}

export interface DetallePedido {
    id?: number;
    producto_id: number;
    cantidad: number;
    nombre_snapshot: string;
    precio_snapshot: number | string;
    subtotal: number | string;
    personalizacion?: number[];
}

export interface Pedido {
    id: number;
    estado_codigo: string;
    forma_pago_codigo: string;
    subtotal: number | string;
    descuento: number | string;
    costo_envio: number | string;
    total: number | string;
    notas: string | null;
    created_at: string;
    detalles: DetallePedido[];
}

export interface PedidoList {
    data: Pedido[];
    total: number;
}

export interface PedidoCreate {
    direccion_id: number;
    forma_pago_codigo: string;
    notas?: string;
    items: {
        producto_id: number;
        cantidad: number;
        personalizacion?: number[];
    }[];
}

export interface FormaPago {
    codigo: string;
    descripcion: string;
    habilitado: boolean;
}
