import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
    producto_id: number;
    nombre: string;
    precio: number;
    imagen_url: string | null;
    cantidad: number;
}

interface CarritoStore {
    items: ItemCarrito[];
    agregar: (item: Omit<ItemCarrito, "cantidad">) => void;
    quitar: (producto_id: number) => void;
    cambiarCantidad: (producto_id: number, cantidad: number) => void;
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
                    const existe = state.items.find((i) => i.producto_id === item.producto_id);
                    if (existe) {
                        return {
                            items: state.items.map((i) =>
                                i.producto_id === item.producto_id
                                    ? { ...i, cantidad: i.cantidad + 1 }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, cantidad: 1 }] };
                }),

            quitar: (producto_id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.producto_id !== producto_id),
                })),

            cambiarCantidad: (producto_id, cantidad) =>
                set((state) => ({
                    items:
                        cantidad <= 0
                            ? state.items.filter((i) => i.producto_id !== producto_id)
                            : state.items.map((i) =>
                                i.producto_id === producto_id ? { ...i, cantidad } : i
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