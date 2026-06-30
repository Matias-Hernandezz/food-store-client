import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
    uid: string;                   // ID único para diferenciar ítems del mismo producto con distinta personalización
    producto_id: number;
    nombre: string;
    precio: number;
    imagen_url: string | null;
    cantidad: number;
    personalizacion: number[];       // IDs de ingredientes removidos
    ingrediente_ids?: number[];     // IDs de todos los ingredientes del producto (para mostrar en checkout)
}

const mismaPersonalizacion = (a: number[], b: number[]): boolean =>
    a.length === b.length && a.every((id) => b.includes(id));

interface CarritoStore {
    items: ItemCarrito[];
    agregar: (item: Omit<ItemCarrito, "uid" | "cantidad" | "personalizacion"> & { cantidad?: number; personalizacion?: number[]; ingrediente_ids?: number[] }) => void;
    quitar: (uid: string) => void;
    cambiarCantidad: (uid: string, cantidad: number) => void;
    editar: (uid: string, cambios: { cantidad?: number; personalizacion?: number[] }) => void;
    limpiar: () => void;
    total: () => number;
    cantidadTotal: () => number;
}

export const useCarrito = create<CarritoStore>()(
    persist(
        (set, get) => ({
            items: [],

            agregar: (item) =>
                set((state) => {
                    const qty = item.cantidad ?? 1;
                    const pers = item.personalizacion ?? [];
                    const existe = state.items.find(
                        (i) => i.producto_id === item.producto_id && mismaPersonalizacion(i.personalizacion, pers)
                    );
                    if (existe) {
                        return {
                            items: state.items.map((i) =>
                                i.producto_id === item.producto_id && mismaPersonalizacion(i.personalizacion, pers)
                                    ? { ...i, cantidad: i.cantidad + qty }
                                    : i
                            ),
                        };
                    }
                    return {
                        items: [...state.items, {
                            ...item,
                            uid: crypto.randomUUID(),
                            cantidad: qty,
                            personalizacion: pers,
                            ingrediente_ids: item.ingrediente_ids ?? [],
                        }],
                    };
                }),

            quitar: (uid) =>
                set((state) => ({
                    items: state.items.filter((i) => i.uid !== uid),
                })),

            cambiarCantidad: (uid, cantidad) =>
                set((state) => ({
                    items:
                        cantidad <= 0
                            ? state.items.filter((i) => i.uid !== uid)
                            : state.items.map((i) =>
                                i.uid === uid ? { ...i, cantidad } : i
                            ),
                })),

            editar: (uid, cambios) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.uid === uid ? { ...i, ...cambios } : i
                    ),
                })),

            limpiar: () => set({ items: [] }),

            total: () =>
                get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

            cantidadTotal: () =>
                get().items.reduce((acc, i) => acc + i.cantidad, 0),
        }),
        { name: "FoodStore-carrito" }
    )
);
