// src/features/catalogo/pages/HomePage.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProductos, useCategorias } from "../hooks/useCatalogo";
import { useCarrito } from "../../carrito/store/carritoStore";
import { useAuth } from "../../auth/context/AuthContext";
import { ShoppingBasketIcon, IdCardIcon } from "../../../assets/icons/Icons";
import { imageUrl } from "../../../shared/utils/imageUrl";
import type { Producto } from "../../../shared/types";
import { ProductoModal } from "../components/ProductoModal";
import { CartDrawer } from "../../carrito/components/CartDrawer";
import { ProductoCard } from "../components/ProductoCard";

export function HomePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [busqueda, setBusqueda] = useState("");
    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [catActivaId, setCatActivaId] = useState<number | null>(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const seccionRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const { data: productosData, isLoading } = useProductos();
    const { data: categoriasData } = useCategorias();
    const { agregar, cantidadTotal } = useCarrito();

    const productos = (productosData?.data ?? []).filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    const categorias = categoriasData?.data ?? [];
    const categoriasPadre = categorias.filter((c) => !c.parent_id);
    const getSubcategorias = (padreId: number) => categorias.filter((c) => c.parent_id === padreId);

    const getProductosDeCat = (catId: number) => {
        const subIds = getSubcategorias(catId).map((s) => s.id);
        return productos.filter((p) =>
            p.categoria_ids?.includes(catId) || subIds.some((sid) => p.categoria_ids?.includes(sid))
        );
    };

    const scrollToCategoria = (catId: number) => {
        setCatActivaId(catId);
        seccionRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleAgregar = (p: Producto) => agregar({
        producto_id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio_base),
        imagen_url: imageUrl(p.imagenes_url),
    });

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5ede6" }}>

            {/* ── Navbar ── */}
            <nav className="bg-white sticky top-0 z-20 shadow-sm" style={{ padding: "12px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#c8722a", fontFamily: "Georgia, serif", flexShrink: 0 }}>
                        Food Store
                    </h1>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9a8070" }}>🔍</span>
                        <input
                            type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar productos..."
                            style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: "#f5ede6", border: "none", borderRadius: 99, fontSize: 14, color: "#2d1e0f", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <button
                            onClick={() => navigate(user ? "/perfil" : "/login")}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1.5px solid #e8ddd5", borderRadius: 99, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2d1e0f" }}
                        >
                            <img src={IdCardIcon} alt="perfil" width="18" height="18" />
                            <span>{user ? user.nombre : "Ingresar"}</span>
                        </button>
                        <button onClick={() => setCarritoAbierto(true)} style={{ position: "relative", background: "#c8722a", border: "none", borderRadius: 12, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingBasketIcon width="22" height="22" className="text-white" />
                            {cantidadTotal() > 0 && (
                                <span style={{ position: "absolute", top: -6, right: -6, background: "#2d1e0f", color: "#fff", fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {cantidadTotal()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
                <img src="/comidas-general.png" alt="Food Store" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 100%)", display: "flex", alignItems: "center", paddingLeft: 48 }}>
                    <div>
                        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Bienvenido</p>
                        <h2 style={{ margin: "0 0 6px", fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
                            ¡Bienvenido a<br />Food Store!
                        </h2>
                        <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Tu comida favorita, a un click de distancia</p>
                        <button
                            onClick={() => { const first = categoriasPadre[0]; if (first) scrollToCategoria(first.id); }}
                            style={{ background: "#c8722a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                        >
                            Ver catálogo →
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Layout: sidebar + productos ── */}
            <div style={{ display: "flex", maxWidth: "100%", margin: "0 auto", padding: "32px 24px", gap: 32, alignItems: "flex-start" }}>

                {/* Sidebar */}
                <aside style={{ width: 200, flexShrink: 0, position: "sticky", top: 80 }}>
                    <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#9a8070", textTransform: "uppercase", letterSpacing: "0.1em" }}>Categorías</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                            onClick={() => { setCatActivaId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            style={{ background: catActivaId === null ? "#c8722a" : "transparent", color: catActivaId === null ? "#fff" : "#2d1e0f", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                        >
                            Todas
                        </button>
                        {categoriasPadre.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => scrollToCategoria(cat.id)}
                                style={{ background: catActivaId === cat.id ? "#c8722a" : "transparent", color: catActivaId === cat.id ? "#fff" : "#2d1e0f", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                        <div style={{ height: 1, background: "#e8ddd5", margin: "8px 0" }} />
                        {user ? (
                            <>
                                <button onClick={() => navigate("/pedidos")} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#2d1e0f" }}> Mis pedidos</button>
                                <button onClick={() => navigate("/perfil")} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#2d1e0f" }}> Mi perfil</button>
                                <button onClick={async () => { await logout(); }} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#e05a3a" }}> Cerrar sesión</button>
                            </>
                        ) : (
                            <button onClick={() => navigate("/login")} style={{ background: "transparent", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", color: "#c8722a" }}> Iniciar sesión</button>
                        )}
                    </div>
                </aside>

                {/* Productos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                            <div className="w-8 h-8 border-2 border-[#c8722a] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {categoriasPadre.map((padre) => {
                                const subCategorias = getSubcategorias(padre.id);
                                return (
                                    <div key={padre.id} ref={(el) => { seccionRefs.current[padre.id] = el; }} style={{ marginBottom: 40 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#2d1e0f", fontFamily: "Georgia, serif" }}>{padre.nombre}</h2>
                                            <div style={{ flex: 1, height: 1, background: "#e8ddd5" }} />
                                        </div>
                                        {subCategorias.length > 0 ? (
                                            subCategorias.map((sub) => {
                                                const prods = getProductosDeCat(sub.id);
                                                if (prods.length === 0) return null;
                                                return (
                                                    <div key={sub.id} style={{ marginBottom: 30 }}>
                                                        <h3 style={{ fontSize: 18, color: "#c8722a", marginBottom: 16 }}>{sub.nombre}</h3>
                                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                                                            {prods.map((p) => (
                                                                <ProductoCard key={p.id} p={p} onAgregar={handleAgregar} onNavigate={setProductoSeleccionado} categorias={categorias} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
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
                                    <p style={{ fontSize: 40, margin: "0 0 12px" }}>🍽️</p>
                                    <p>No hay productos disponibles</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {carritoAbierto && <CartDrawer onClose={() => setCarritoAbierto(false)} />}

            {productoSeleccionado && (
                <ProductoModal producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
            )}
        </div>
    );
}