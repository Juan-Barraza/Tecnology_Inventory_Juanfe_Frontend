# Tecnology Inventory — Frontend

Aplicación web para gestión de inventario tecnológico. Construida con React, Vite y TypeScript.

---

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| Vite | 7 | Build tool |
| TypeScript | 5 | Tipado |
| TanStack Query | 5 | Fetching y cache |
| Axios | 1.x | HTTP client |
| React Router | 7 | Navegación |
| React Hook Form | 7 | Formularios |
| Zod | 3 | Validación de esquemas |
| Zustand | 5 | Estado global (auth) |
| Tailwind CSS | 4 | Estilos |

---

## Estructura del proyecto

```
src/
├── api/                        # Una función por endpoint — sin lógica
│   ├── assets.api.ts
│   ├── assignments.api.ts
│   ├── auth.api.ts
│   ├── catalogs.api.ts
│   ├── dashboard.api.ts
│   └── inventory.api.ts
│
├── hooks/                      # TanStack Query — un hook por recurso
│   ├── query-keys.ts           # Claves centralizadas para el cache
│   ├── useAssets.ts
│   ├── useAssignments.ts
│   ├── useAuth.ts
│   ├── useCatalogs.ts
│   ├── useDashboard.ts
│   ├── useDebounce.ts
│   └── useInventory.ts
│
├── store/
│   └── auth.store.ts           # Token y usuario — persiste en localStorage
│
├── types/                      # Tipos TypeScript que reflejan los DTOs del backend
│   ├── asset.type.ts
│   ├── assignment.type.ts
│   ├── auth.types.ts
│   ├── catalog.types.ts
│   ├── dashboard.types.ts
│   └── inventory.types.ts
│
├── utils/
│   ├── constants.ts            # Labels y colores por status
│   └── date.ts                 # Formateo de fechas
│
├── lib/
│   ├── axios.ts                # Instancia con interceptors de auth y 401
│   └── queryClient.ts          # Configuración de TanStack Query
│
├── layouts/
│   ├── AppLayout.tsx           # Sidebar + header — rutas protegidas
│   └── AuthLayout.tsx          # Wrapper para login
│
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── assets/
│   │   ├── AssetsPage.tsx
│   │   ├── AssetDetailPage.tsx
│   │   └── components/
│   │       ├── AddAssetModal.tsx
│   │       ├── AssignmentModal.tsx
│   │       └── ChangeStatusModal.tsx
│   └── inventory/
│       ├── InventoryPage.tsx
│       ├── PeriodDetailPage.tsx
│       └── components/
│           ├── NoPeriodView.tsx
│           ├── OpenPeriodView.tsx
│           └── ClosedPeriodsTable.tsx
│
├── router/
│   └── index.tsx               # Rutas + guards de autenticación
│
├── index.css                   # Tailwind imports + estilos globales
└── main.tsx                    # Entry point
```

---

## Arquitectura por capas

```
Page / Component
    ↓
Hook (useQuery / useMutation)   — TanStack Query
    ↓
API function                    — Axios call
    ↓
Backend REST API
```

**Regla de responsabilidad única:**

- `api/` — solo sabe hacer la llamada HTTP. Sin React, sin estado
- `hooks/` — conecta `api/` con TanStack Query. Sin JSX
- `components/ui/` — recibe props y renderiza. Sin lógica de negocio
- `pages/` — orquesta hooks y componentes. Único punto de unión
- `store/` — solo el token y el usuario. Nada más va al store global

---

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_URL=/api/v1
```

Para desarrollo, el proxy de Vite redirige `/api` → `http://localhost:8080`, por lo que no necesitas cambiar nada si el backend corre localmente.

---

## Configuración del proxy (desarrollo)

`vite.config.ts` incluye proxy automático al backend:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

Esto evita problemas de CORS en desarrollo — todas las llamadas salen desde `localhost:5173/api/...`.

---

## Autenticación

El sistema usa JWT almacenado en `localStorage` via Zustand con `persist`.

- Al hacer login, el token se guarda en `auth-storage` (localStorage)
- El interceptor de Axios agrega `Authorization: Bearer <token>` automáticamente en cada request
- Si un endpoint protegido devuelve 401, el interceptor ejecuta logout — excepto el endpoint de login
- Los guards `ProtectedRoute` y `PublicRoute` en el router leen el token directamente desde el store

---

## Módulos de la aplicación

### Dashboard `/dashboard`

Estadísticas generales del inventario:
- Total de activos por estado lógico
- Progreso del inventario mensual activo
- Distribución por categoría y ciudad

### Activos `/assets`

- Listado paginado con filtros por ciudad, área, categoría, estado y búsqueda por texto
- Búsqueda con debounce de 400ms
- Paginación con ventana deslizante
- Vista tabla en desktop, cards en móvil
- Detalle completo del activo con asignación activa, historial de estados

### Inventario `/inventory`

Flujo mensual de auditoría:

1. **Sin período abierto** — botón para abrir el inventario del mes actual
2. **Con período abierto** — lista todos los activos activos con estado de revisión (Pendiente / Confirmado / Dado de baja). Paginación client-side, búsqueda por código/descripción
3. **Confirmar** — el activo fue visto físicamente. Solo registra el `inventory_record`
4. **Dar de baja** — cambia `logical_status` del activo a `written_off` + registra el record
5. **Cerrar período** — modal de confirmación con alerta si hay activos sin revisar
6. **Períodos cerrados** — tabla con historial paginado (3 por página), navegable al detalle

---

## Convenciones de código

### Nombres de archivos

- Componentes: `PascalCase.tsx`
- Hooks: `camelCase.ts` con prefijo `use`
- API: `camelCase.api.ts`
- Tipos: `camelCase.types.ts`

### Manejo de errores del servidor

```tsx
const serverError = (error as any)?.response?.data?.error
```

El backend siempre responde con `{"success": false, "error": "mensaje"}`.

### Formularios

Todos los formularios usan React Hook Form + Zod. Los IDs de selects se registran con `valueAsNumber: true` para que el tipo sea `number` y no `string`.

### Estado optimista

El inventario mensual usa `optimisticMap` para reflejar cambios inmediatamente sin esperar la respuesta del servidor. Si el request falla, el mapa se revierte automáticamente.

---

## Query Keys

Todas las claves de TanStack Query están centralizadas en `hooks/query-keys.ts`:

```ts
queryKeys.assets.list(filters)       // lista paginada
queryKeys.assets.detail(id)          // detalle de un activo
queryKeys.assets.history(id)         // historial de estados
queryKeys.inventory.periods()        // lista de períodos
queryKeys.inventory.assets(periodId) // activos con estado en el período
queryKeys.inventory.progress(periodId)
```

Esto permite invalidaciones quirúrgicas — al confirmar un activo en inventario solo se invalidan las queries de ese período, no toda la caché.

---

## Estilos

Tailwind CSS v4. Las clases personalizadas están definidas en `index.css`:

```css
.btn-primary { ... }   /* Botón verde principal */
.card { ... }          /* Card con fondo blanco y borde */
```

Los colores de estado se centralizan en `utils/constants.ts`:

```ts
LOGICAL_STATUS_COLOR['active']       // 'bg-green-100 text-green-800 ...'
LOGICAL_STATUS_LABEL['written_off']  // 'Dado de baja'
PHYSICAL_STATUS_COLOR['deteriorated']
MONTHS[3]                            // 'Marzo'
```
