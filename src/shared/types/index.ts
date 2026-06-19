export interface LoginInput {
    email: string;
    password: string;
}

export interface DireccionCreate {
    usuario_id: number;
    alias?: string;       // Opcional
    linea1: string;       // Obligatorio
    linea2?: string;      // Opcional
    ciudad: string;       // Obligatorio
    provincia?: string;   // Opcional
    codigo_postal?: string; // Opcional
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
    deleted_at?: string; // Usamos string porque las fechas llegan como texto (ISO 8601) desde FastAPI
}

export interface UsuarioCreate {
    nombre: string;
    apellido: string;
    email: string;
    celular?: string;
    password: string;
}

export interface UsuarioRead {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: string | null;
    roles: string[];
    deleted_at: string | null;
}


export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    imagen_url: string | null;
    parent_id: number | null;
}

export interface Ingrediente {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria_id?: number;
    es_alergeno: boolean;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagenes_url: string[] | null;
    disponible: boolean;
    stock_cantidad: number;
    categoria_ids: number[];
    categoria?: Categoria;
    ingrediente_ids?: number[];
}

export interface ProductoList {
    data: Producto[];
    total: number;
}

export interface ItemCarritoInput {
    producto_id: number;
    cantidad: number;
    personalizacion?: number[];  // IDs de ingredientes removidos
}

export interface PedidoCreate {
    direccion_id: number;
    forma_pago_codigo: string;
    notas?: string;
    items: ItemCarritoInput[];
}

export interface DetallePedido {
    producto_id: number;
    cantidad: number;
    nombre_snapshot: string;
    precio_snapshot: number | string;
    subtotal: number | string;
    personalizacion?: number[];  // IDs de ingredientes removidos
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

export interface FormaPago {
    codigo: string;
    descripcion: string;
    habilitado: boolean;
}


export const toNumber = (val: number | string): number => Number(val);