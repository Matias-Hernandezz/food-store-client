// shared/types/index.ts
// Tipos compartidos entre múltiples features. Cada feature tiene sus tipos específicos
// en features/{nombre}/types/. Cumple FSD: sin cross-imports entre features.

// ─── PAGINACIÓN GENÉRICA ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

// ─── USUARIO ─────────────────────────────────────────────────────────────────

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

// ─── CATÁLOGO ────────────────────────────────────────────────────────────────

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
    unidad_venta?: { id: number; nombre: string; simbolo: string; tipo: string } | null;
    cantidad_venta?: number | null;
}

export type ProductoList = PaginatedResponse<Producto>;

// ─── CARRITO ─────────────────────────────────────────────────────────────────

export interface ItemCarritoInput {
    producto_id: number;
    cantidad: number;
    personalizacion?: number[];
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────

export const toNumber = (val: number | string): number => Number(val);
