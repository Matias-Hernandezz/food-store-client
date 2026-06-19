import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import { useUIStore } from "./store/uiStore";
import { HomePage } from "./features/catalogo/pages/HomePage";
import { ProductoDetailPage } from "./features/catalogo/pages/ProductoDetailPage";
import { PedidosPage } from "./features/pedidos/pages/PedidosPage";
import { RealizarPedidoPage } from "./features/pedidos/pages/RealizarPedidoPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { PerfilPage } from "./features/usuarios/pages/PerfilPage";

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
  { path: "*", element: <HomePage /> },
]);

function AuthGate({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
        <RouterProvider router={router} />
      </AuthGate>
      <ToastContainer />
    </QueryClientProvider>
  );
}

function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-bold cursor-pointer animate-[slideIn_0.3s_ease] max-w-xs ${
            t.type === "success"
              ? "bg-[#c8722a] text-white"
              : t.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
