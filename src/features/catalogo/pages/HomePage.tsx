// src/features/catalogo/pages/HomePage.tsx
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCatalogo } from "../hooks/useCatalogo";
import { useCarrito } from "../../../store/carritoStore";
import { useAuthStore } from "../../../store/authStore";
import { ShoppingBasketIcon, SearchIcon, GridIcon, ReceiptIcon, UserIcon, LogoutIcon, LogInIcon, MealIcon, DrinkIcon, AppetizerIcon } from "../../../assets/icons/Icons";
import { imageUrl } from "../../../shared/utils/imageUrl";
import type { Producto } from "../../../shared/types";
import { ProductoModal } from "../components/ProductoModal";
import { CartDrawer } from "../../carrito/components/CartDrawer";
import { PerfilModal } from "../../usuarios/components/PerfilModal";
import { PedidosModal } from "../../pedidos/components/PedidosModal";
import { ConnectionBadge } from "../../pedidos/components/ConnectionBadge";
import { ProductoCard } from "../components/ProductoCard";

export function HomePage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [busquedaInput, setBusquedaInput] = useState("");
    const [busqueda, setBusqueda] = useState("");

    // Debounce search — evita llamadas al backend en cada tecla
    useEffect(() => {
        const timer = setTimeout(() => setBusqueda(busquedaInput), 300);
        return () => clearTimeout(timer);
    }, [busquedaInput]);

    const [filtroPrecioMinInput, setFiltroPrecioMinInput] = useState("");
    const [filtroPrecioMaxInput, setFiltroPrecioMaxInput] = useState("");
    const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
    const [filtroPrecioMax, setFiltroPrecioMax] = useState("");

    // Debounce precio — evita llamadas al backend en cada tecla
    useEffect(() => {
        const timer = setTimeout(() => {
            setFiltroPrecioMin(filtroPrecioMinInput);
            setFiltroPrecioMax(filtroPrecioMaxInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [filtroPrecioMinInput, filtroPrecioMaxInput]);

    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [pedidosAbierto, setPedidosAbierto] = useState(false);
    const [catActivaId, setCatActivaId] = useState<number | null>(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [filtroEnStock, setFiltroEnStock] = useState(false);
    const [page, setPage] = useState(1);
    const seccionRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [searchParams, setSearchParams] = useSearchParams();

    // CH-06: Abre el modal "Mis Pedidos" cuando se llega con ?pedidos=open
    // (post-checkout). Limpia el param para no re-abrir en refresh.
    useEffect(() => {
        if (searchParams.get("pedidos") === "open") {
            setPedidosAbierto(true);
            const next = new URLSearchParams(searchParams);
            next.delete("pedidos");
            setSearchParams(next, { replace: true });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { data: productosData, isLoading, categorias: categoriasData } = useCatalogo(useMemo(() => ({
        categoria: catActivaId || undefined,
        search: busqueda || undefined,
        precio_min: filtroPrecioMin ? Number(filtroPrecioMin) : undefined,
        precio_max: filtroPrecioMax ? Number(filtroPrecioMax) : undefined,
        en_stock: filtroEnStock || undefined,
        page,
    }), [catActivaId, busqueda, filtroPrecioMin, filtroPrecioMax, filtroEnStock, page]));
    const { agregar, cantidadTotal } = useCarrito();

    // Resetear página al cambiar filtros o categoría
    useEffect(() => {
        setPage(1);
    }, [catActivaId, busqueda, filtroPrecioMin, filtroPrecioMax, filtroEnStock]);

    const productos = productosData?.data ?? [];
    const categorias = categoriasData?.data ?? [];
    const categoriasPadre = categorias.filter((c) => !c.parent_id);
    const getSubcategorias = (padreId: number) => categorias.filter((c) => c.parent_id === padreId);

    const getProductosDeCat = (catId: number) => {
        const subIds = getSubcategorias(catId).map((s) => s.id);
        return productos.filter((p) =>
            p.categoria_ids?.includes(catId) || subIds.some((sid) => p.categoria_ids?.includes(sid))
        );
    };

    // Solo productos DIRECTAMENTE asignados a la categoria (sin incluir subcategorias)
    const getProductosDirectosDeCat = (catId: number) => {
        return productos.filter((p) => p.categoria_ids?.includes(catId));
    };

    const handleAgregar = (p: Producto) => agregar({
        producto_id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio_base),
        imagen_url: imageUrl(p.imagenes_url),
    });

    // ── Ícono por categoría ──────────────────────────────────────────
    const iconoParaCategoria = (nombre: string) => {
        const n = nombre.toLowerCase();
        if (n.includes("bebida") || n.includes("trago")) return <DrinkIcon width="16" height="16" />;
        if (n.includes("entrada") || n.includes("snack") || n.includes("picada")) return <AppetizerIcon width="16" height="16" />;
        if (n.includes("comida") || n.includes("plato") || n.includes("pizza") || n.includes("hamburguesa")) return <MealIcon width="16" height="16" />;
        return <GridIcon width="16" height="16" />;
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#E8D5C0" }}>

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-20 shadow-md" style={{ padding: "12px 24px", background: "#3D2B1F" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
                    <button
                        onClick={() => setSidebarVisible(!sidebarVisible)}
                        className="md:hidden p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8D5C0" strokeWidth="2.5">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#E8D5C0", fontFamily: "Georgia, serif", flexShrink: 0 }}>
                        Food Store
                    </h1>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}><SearchIcon width="16" height="16" /></span>
                        <input
                            type="text" value={busquedaInput} onChange={(e) => setBusquedaInput(e.target.value)}
                            placeholder="Buscar productos..."
                            style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 99, fontSize: 14, color: "#E8D5C0", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <ConnectionBadge light />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <button
                            onClick={() => user ? setPerfilAbierto(true) : navigate("/login")}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#E8D5C0" }}
                        >
                            <UserIcon width={18} height={18} />
                            <span>{user ? user.nombre : "Ingresar"}</span>
                        </button>
                        <button onClick={() => setCarritoAbierto(true)} style={{ position: "relative", background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 12, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8D5C0" }}>
                            <ShoppingBasketIcon width="22" height="22" style={{ color: "#E8D5C0" }} />
                            {cantidadTotal() > 0 && (
                                <span style={{ position: "absolute", top: -6, right: -6, background: "#2d1e0f", color: "#ffffff", fontSize: 11, fontWeight: 700, width: 20, height: 20, lineHeight: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {cantidadTotal()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <div style={{ position: "relative", height: 340, overflow: "hidden" }}>
                <img src="/comidas-general.png" alt="Food Store" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.05) 100%)", display: "flex", alignItems: "center", paddingLeft: 48 }}>
                    <div>
                        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Bienvenido</p>
                        <h2 style={{ margin: "0 0 6px", fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
                            ¡Bienvenido a<br />Food Store!
                        </h2>
                        <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Tu comida favorita, a un click de distancia</p>
                    </div>
                </div>
            </div>

            {/* ── Layout: sidebar + productos ── */}
            <div style={{ display: "flex", maxWidth: "100%", margin: "0 auto", padding: "32px 24px", gap: 32, alignItems: "flex-start" }}>

                {/* Sidebar */}
                <aside className={`md:block ${sidebarVisible ? "fixed inset-0 z-30 bg-[#E8D5C0] p-6 pt-20 md:relative md:inset-auto md:p-0 md:pt-0 md:bg-transparent" : "hidden"} md:block`} style={{ width: 200, flexShrink: 0, position: "sticky", top: 80 }}>
                    {/* Close button mobile */}
                    <button onClick={() => setSidebarVisible(false)} className="md:hidden absolute top-4 right-4 text-[#2d1e0f] text-xl font-bold">✕</button>
                    <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#9a8070", textTransform: "uppercase", letterSpacing: "0.1em" }}>Categorías</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                            onClick={() => { setCatActivaId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            style={{ background: catActivaId === null ? "#C87A2E" : "transparent", color: catActivaId === null ? "#E8D5C0" : "#2d1e0f", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all .15s", display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <GridIcon width="16" height="16" />
                            Todas
                        </button>
                        {categoriasPadre.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setCatActivaId(cat.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                style={{ background: "transparent", color: catActivaId === cat.id ? "#C87A2E" : "#2d1e0f", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all .15s", display: "flex", alignItems: "center", gap: 8 }}
                            >
                                {iconoParaCategoria(cat.nombre)}
                                {cat.nombre}
                            </button>
                        ))}
                        <div style={{ height: 1, background: "#2d1e0f", margin: "8px 0" }} />
                        {user ? (
                            <>
                                <button onClick={() => setPedidosAbierto(true)} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#2d1e0f", display: "flex", alignItems: "center", gap: 8 }}><ReceiptIcon width={16} height={16} style={{ color: "#2d1e0f" }} /> Mis pedidos</button>
                                <button onClick={() => setPerfilAbierto(true)} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#2d1e0f", display: "flex", alignItems: "center", gap: 8 }}><UserIcon width={16} height={16} style={{ color: "#2d1e0f" }} /> Mi perfil</button>
                                <button onClick={async () => { await logout(); }} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#e05a3a", display: "flex", alignItems: "center", gap: 8 }}><LogoutIcon width={16} height={16} style={{ color: "#e05a3a" }} /> Cerrar sesión</button>
                            </>
                        ) : (
                            <button onClick={() => navigate("/login")} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#C87A2E", display: "flex", alignItems: "center", gap: 8 }}><LogInIcon width={16} height={16} style={{ color: "#C87A2E" }} /> Iniciar sesión</button>
                        )}
                    </div>
                </aside>

                {/* Productos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Filtros rápidos */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="number" placeholder="Precio min" value={filtroPrecioMinInput}
                            onChange={(e) => setFiltroPrecioMinInput(e.target.value)}
                            style={{ width: 100, padding: "6px 10px", border: "1px solid #E5E2DA", borderRadius: 8, fontSize: 12, color: "#2d1e0f", background: "#fff", outline: "none" }}
                        />
                        <span style={{ color: "#9a8070", fontSize: 12 }}>—</span>
                        <input
                            type="number" placeholder="Precio max" value={filtroPrecioMaxInput}
                            onChange={(e) => setFiltroPrecioMaxInput(e.target.value)}
                            style={{ width: 100, padding: "6px 10px", border: "1px solid #E5E2DA", borderRadius: 8, fontSize: 12, color: "#2d1e0f", background: "#fff", outline: "none" }}
                        />
                        <button
                            onClick={() => setFiltroEnStock(!filtroEnStock)}
                            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #E5E2DA", cursor: "pointer", background: filtroEnStock ? "#C87A2E" : "#fff", color: filtroEnStock ? "#fff" : "#6b5a4e" }}
                        >
                            En stock
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="bg-[#E8D5C0] rounded-2xl p-4 animate-pulse" style={{ border: "1px solid #e8ddd5" }}>
                                    <div className="h-40 bg-[#e8ddd5] rounded-xl mb-3" />
                                    <div className="h-4 bg-[#e8ddd5] rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-[#E8D5C0] rounded w-1/2 mb-4" />
                                    <div className="flex justify-between items-center">
                                        <div className="h-5 bg-[#e8ddd5] rounded w-20" />
                                        <div className="h-9 bg-[#e8ddd5] rounded-lg w-9" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {categoriasPadre.map((padre) => {
                                const subCategorias = getSubcategorias(padre.id);
                                // Verificar si hay productos visibles: en subs O directos en el padre (no incluye subs)
                                const tieneProductos = (subCategorias.length > 0
                                    ? subCategorias.some((sub) => getProductosDeCat(sub.id).length > 0)
                                    : false) || getProductosDirectosDeCat(padre.id).length > 0;
                                if (!tieneProductos) return null;
                                return (
                                    <div key={padre.id} ref={(el) => { seccionRefs.current[padre.id] = el; }} style={{ marginBottom: 40 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#2d1e0f", fontFamily: "Georgia, serif" }}>{padre.nombre}</h2>
                                            <div style={{ flex: 1, height: 1, background: "#2d1e0f" }} />
                                        </div>
                                        {/* Productos directos del padre (cuando tiene subs + productos propios) */}
                                        {subCategorias.length > 0 && (() => {
                                            const prodsPadre = getProductosDirectosDeCat(padre.id);
                                            if (prodsPadre.length === 0) return null;
                                            return (
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12, marginBottom: 24 }}>
                                                    {prodsPadre.map((p) => (
                                                        <ProductoCard key={p.id} p={p} onAgregar={handleAgregar} onNavigate={setProductoSeleccionado} categorias={categorias} />
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                        {subCategorias.length > 0 ? (
                                            subCategorias.map((sub) => {
                                                const prods = getProductosDeCat(sub.id);
                                                if (prods.length === 0) return null;
                                                return (
                                                    <div key={sub.id} style={{ marginBottom: 30 }}>
                                                        <h3 style={{ fontSize: 18, color: "#2d1e0f", marginBottom: 16 }}>{sub.nombre}</h3>
                                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                                                            {prods.map((p) => (
                                                                <ProductoCard key={p.id} p={p} onAgregar={handleAgregar} onNavigate={setProductoSeleccionado} categorias={categorias} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                                                {getProductosDeCat(padre.id).map((p) => (
                                                    <ProductoCard key={p.id} p={p} onAgregar={handleAgregar} onNavigate={setProductoSeleccionado} categorias={categorias} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {productos.length === 0 && (
                                <div style={{ textAlign: "center", padding: "60px 0", color: "#9a8070" }}>
                                    <MealIcon width={48} height={48} style={{ color: "#2d1e0f", opacity: 0.3, margin: "0 auto 12px" }} />
                                    <p>No hay productos disponibles</p>
                                </div>
                            )}
                            {productos.length > 0 && (productosData?.total ?? 0) > page * 100 && (
                                <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
                                    <button
                                        onClick={() => setPage((p) => p + 1)}
                                        style={{
                                            background: "transparent",
                                            border: "2px solid #2d1e0f",
                                            borderRadius: 12,
                                            padding: "10px 28px",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#2d1e0f",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cargar más productos
                                    </button>
                                    <p style={{ marginTop: 8, fontSize: 11, color: "#9a8070" }}>
                                        Mostrando {productos.length} de {productosData?.total}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {carritoAbierto && <CartDrawer onClose={() => setCarritoAbierto(false)} />}
            {perfilAbierto && <PerfilModal open={perfilAbierto} onClose={() => setPerfilAbierto(false)} onOpenPedidos={() => setPedidosAbierto(true)} />}
            {pedidosAbierto && <PedidosModal open={pedidosAbierto} onClose={() => setPedidosAbierto(false)} />}

            {productoSeleccionado && (
                <ProductoModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
            )}

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="mt-16 py-10 text-center" style={{ borderTop: "1px solid #e8ddd5" }}>
                <div className="w-10 h-10 rounded-full bg-[#E8D5C0] flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 2v7c0 1.1.9 2 2 2h.5V22h2V11H8c1.1 0 2-.9 2-2V2H8v5H6V2H4v5H3V2H3z" fill="#2d1e0f" />
                        <path d="M15 2c-1.9 0-3.5 1.6-3.5 3.5v7c0 1.4.9 2.5 2 2.8V22h2V15.3c1.1-.3 2-1.4 2-2.8v-7C17.5 3.6 16.9 2 15 2z" fill="#2d1e0f" />
                    </svg>
                </div>
                <p className="text-xs text-[#9a8070] tracking-wide uppercase font-bold mb-1">Food Store</p>
                <p className="text-xs text-[#b09080] italic" style={{ fontFamily: "'Georgia', serif" }}>
                    "Donde la tradición se encuentra con un simple click."
                </p>
                <p className="text-[10px] text-[#c8b4a0] mt-4">© 2026 Food Store — v6.0</p>
            </footer>
        </div>
    );
}