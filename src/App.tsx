import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { HomePage } from "./features/catalogo/pages/HomePage";
import { ProductoDetailPage } from "./features/catalogo/pages/ProductoDetailPage";
import { PedidosPage } from "./features/pedidos/pages/PedidosPage";
import { RealizarPedidoPage } from "./features/pedidos/pages/RealizarPedidoPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { PerfilPage } from "./features/usuarios/pages/PerfilPage";
import { CheckoutPage } from "./features/pedidos/components/CheckoutPage";

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
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "*", element: <HomePage /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}