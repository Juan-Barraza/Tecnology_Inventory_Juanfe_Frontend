import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Inventario Juanfe</h1>
          <p className="text-slate-500 dark:text-slate-400">Sistema de Gestión Tecnológica</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            <Outlet />
          </div>
          <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Juanfe. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}