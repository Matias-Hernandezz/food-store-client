# 🍔 Food Store — Tienda Cliente

Frontend de la tienda online para Food Store. Clientes exploran el catalogo, gestionan carrito, realizan pedidos con pago integrado via MercadoPago y siguen sus pedidos en tiempo real via WebSocket.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | React 19 |
| Lenguaje | TypeScript 5.x |
| Build | Vite 5.x |
| Estilos | Tailwind CSS 3.x |
| Estado cliente | Zustand 4.x (auth, carrito, UI, WebSocket, pagos) |
| Estado servidor | TanStack Query 5.x |
| HTTP | Axios 1.x (interceptors JWT + refresh 401) |
| Pagos | MercadoPago SDK React (Brick CardPayment, PCI SAQ-A) |
| WebSocket | Conexion nativa con reconexion exponencial |
| Imagenes | Cloudinary CDN (transformaciones on-the-fly) |

## Prerequisitos

- **Node.js** 20+ + **pnpm** 9+
- **Backend corriendo** en `http://localhost:8000` (ver [Food Store Admin](https://github.com/...))

---

## Setup — Paso a Paso

### 1. Configurar variables de entorno

```powershell
copy .env.example .env
```

Editar `.env` y completar:

| Variable | Valor de ejemplo |
|----------|-----------------|
| `VITE_API_URL` | `http://localhost:8000` |
| `VITE_MP_PUBLIC_KEY` | `TEST-abcdef12-1234-5678-9012-abcdef123456` (Public Key de MercadoPago) |

> 💡 La Public Key de MP se obtiene en: https://www.mercadopago.com.ar/developers/panel

### 2. Instalar dependencias

```powershell
pnpm install
```

### 3. Levantar el frontend

```powershell
pnpm dev
```

Tienda disponible en **http://localhost:5173**

---

## Features

| Feature | Descripcion |
|---------|-------------|
| **Catalogo** | Navegacion por categorias, busqueda, filtro por disponibilidad, paginacion |
| **Producto** | Vista detalle con ingredientes, alérgenos, personalizacion (remover ingredientes) |
| **Carrito** | Persistente (Zustand + localStorage), cantidades, subtotales |
| **Checkout** | Seleccion de direccion, forma de pago, notas |
| **MercadoPago** | Brick CardPayment embebido (datos de tarjeta NUNCA tocan nuestro servidor) |
| **Pedidos** | Listado de pedidos propios con filtros por fecha y estado |
| **WebSocket** | Timeline en tiempo real del estado del pedido, badge de conexion |
| **Perfil** | Datos del usuario, cambio de contraseña |

## Stores Zustand (5)

| Store | Archivo | Persiste | Responsabilidad |
|-------|---------|----------|-----------------|
| `authStore` | `store/authStore.ts` | Si (accessToken) | Sesion, login, logout, refresh |
| `carritoStore` | `features/carrito/store/carritoStore.ts` | Si (items) | Items, cantidades, personalizacion |
| `uiStore` | `store/uiStore.ts` | No | Toasts, UI local |
| `wsStore` | `features/pedidos/store/wsStore.ts` | No | Estado conexion WebSocket, ultimo evento |
| `paymentStore` | `features/pedidos/store/paymentStore.ts` | No | Flujo de pago MP, reintentos |

---

## Estructura del Proyecto

```
store/
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── main.tsx                       # Entry point
    ├── App.tsx                        # Rutas
    ├── store/                         # Zustand stores globales
    │   ├── authStore.ts
    │   └── uiStore.ts
    ├── shared/
    │   ├── api/                       # Axios client + interceptors
    │   ├── types/                     # Tipos compartidos (Producto, Pedido, etc.)
    │   └── utils/                     # Cloudinary imageUrl, helpers
    └── features/
        ├── auth/                      # Login, registro
        │   ├── api/
        │   ├── components/
        │   └── pages/
        ├── catalogo/                  # Listado, detalle, busqueda
        │   ├── api/
        │   ├── components/            # ProductoCard, ProductoModal
        │   ├── hooks/                 # useCatalogo (TanStack Query)
        │   └── pages/
        ├── carrito/                   # Carrito persistente
        │   ├── components/            # CartDrawer
        │   └── store/                 # carritoStore
        ├── pedidos/                   # Pedidos, pago, WebSocket
        │   ├── api/
        │   ├── components/            # MercadoPagoBrick, OrderTimeline, ConnectionBadge
        │   ├── hooks/                 # usePedidos, useOrderStatusWS
        │   ├── pages/                 # PedidosPage, RealizarPedidoPage
        │   └── store/                 # wsStore, paymentStore
        └── usuarios/                  # Perfil
            ├── components/
            └── pages/
```

---

## Flujo de Compra

1. **Catalogo** → El cliente navega productos, filtra por categoria, busca por nombre
2. **Producto** → Ve detalle con ingredientes. Puede remover ingredientes (personalizacion)
3. **Carrito** → Agrega items. El carrito persiste en localStorage
4. **Checkout** → Selecciona direccion de entrega y forma de pago
5. **MercadoPago** → Si elige MP, se muestra el Brick CardPayment. Los datos de tarjeta los tokeniza MP (PCI SAQ-A)
6. **Pedido creado** → El backend crea el pedido con snapshots de precios
7. **Seguimiento** → Timeline en tiempo real via WebSocket. El estado se actualiza sin recargar

---

## Tarjetas de Prueba — MercadoPago

El resultado del pago depende del **importe** del pedido:

| Importe | Resultado |
|---------|-----------|
| < $200 | Aprobado |
| $200 – $600 | Pendiente |
| > $600 | Rechazado |

**Numero:** `5031 7557 3453 0604` | **Vencimiento:** cualquiera | **CVV:** `123` | **Titular:** `APRO`

---

## Checklist de Rubrica

| Codigo | Item |
|--------|------|
| CE-01 | Repositorio GitHub publico |
| CE-02 | README con instrucciones de setup |
| CE-03 | `.env.example` completo (`VITE_API_URL`, `VITE_MP_PUBLIC_KEY`) |
| CE-06 | `pnpm install + pnpm dev` sin errores |
| CE-09 | Pago de prueba MP end-to-end + notificacion WS |
| CE-11 | 5 Zustand stores implementados, tipados y con persist |
| CE-12 | WebSocket: cambio de estado actualiza UI del cliente sin recargar |
| CE-15 | Video demostracion (10-15 min) |
| CE-16 | Repositorio publico verificado |

> ⚠ Este frontend requiere el backend corriendo en `http://localhost:8000`. Sin el backend, el catalogo, carrito y pedidos no funcionan.

---

Proyecto academico — Food Store v6.0
