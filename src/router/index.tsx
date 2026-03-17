import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import AssetsPage from '@/pages/assets/AssetsPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AssetDetailPage from '@/pages/assets/AssetDetailPage'
import InventoryPage from '@/pages/inventory/InventoryPage'
import PeriodDetailPage from '@/pages/inventory/PeriodoDetailPage'

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicRoute() {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/assets', element: <AssetsPage /> },
          { path: '/assets/:id', element: <AssetDetailPage /> },
          { path: '/inventory', element: <InventoryPage /> },
          { path: '/inventory/periods/:id', element: <PeriodDetailPage /> },

        ],
      },
    ],
  },
])