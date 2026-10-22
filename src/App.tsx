import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import { useUIStore } from "./store/uiStore";
import { useOrderStatusWS } from "./features/pedidos/hooks/useOrderStatusWS";
import { pedidosApi } from "./features/pedidos/api/pedidosApi";

const ESTADOS_PEDIDO_TERMINALES = new Set(["ENTREGADO", "CANCELADO"]);
import { HomePage } from "./features/catalogo/pages/HomePage";
import { ProductoDetailPage } from "./features/catalogo/pages/ProductoDetailPage";
import { PedidosPage } from "./features/pedidos/pages/PedidosPage";
import { RealizarPedidoPage } from "./features/pedidos/pages/RealizarPedidoPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { PerfilPage } from "./features/usuarios/pages/PerfilPage";
import { SeguimientoPage } from "./features/public/pages/SeguimientoPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/producto/:id", element: <ProductoDetailPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/perfil", element: <PerfilPage /> },
  { path: "/realizar-pedido", element: <RealizarPedidoPage /> },
  { path: "/pedidos", element: <PedidosPage /> },
  { path: "/seguimiento/:token", element: <SeguimientoPage /> },
  { path: "*", element: <HomePage /> },
]);

function AuthGate({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    // Solo intentar cargar el usuario si hay token persistido
    const token = useAuthStore.getState().accessToken;
    if (token) fetchUser();
    else useAuthStore.setState({ isLoading: false });
  }, [fetchUser]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <GlobalWS />
        <RouterProvider router={router} />
      </AuthGate>
      <ToastContainer />
    </QueryClientProvider>
  );
}

function GlobalWS() {
  const user = useAuthStore((s) => s.user);

  const { data: misPedidos } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: () => pedidosApi.getMisPedidos(),
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const pedidoIds = useMemo(
    () =>
      (misPedidos?.data ?? [])
        .filter((p) => !ESTADOS_PEDIDO_TERMINALES.has(p.estado_codigo))
        .map((p) => p.id),
    [misPedidos],
  );

  useOrderStatusWS({
    pedidoIds,
    enabled: !!user,
    getToken: async () => {
      const token = useAuthStore.getState().accessToken;
      if (token) return token;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/auth/token`,
        { credentials: "include" }
      );
      const data = await res.json();
      return data.access_token ?? null;
    },
  });

  return null;
}

function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-bold cursor-pointer animate-[slideIn_0.3s_ease] max-w-xs ${
            t.type === "success"
              ? "bg-[#2d1e0f] text-[#E8D5C0]"
              : t.type === "error"
              ? "bg-red-600 text-white"
              : "bg-[#F2E8D5] text-[#2d1e0f]"
          }`}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
