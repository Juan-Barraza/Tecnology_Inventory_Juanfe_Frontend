import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { MONTHS } from '@/utils/constants'
import type { CategoryStat, CityStat } from '@/types/dashboard.type'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        Cargando dashboard...
      </div>
    )
  }

  const assets = data?.assets
  const inventory = data?.inventory
  const cats = data?.categories ?? []
  const cities = data?.cities ?? []

  const uptimePct = assets && assets.total > 0
    ? Math.round((assets.active / assets.total) * 100)
    : 0

  return (
    <div className="space-y-6">

      {/* Stats de activos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total activos"
          value={assets?.total ?? 0}
          sub="en inventario"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          color="slate"
        />
        <StatCard
          label="Activos"
          value={assets?.active ?? 0}
          sub={`${uptimePct}% del total`}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="green"
        />
        <StatCard
          label="Inactivos"
          value={assets?.inactive ?? 0}
          sub="requieren revisión"
          icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          color="yellow"
        />
        <StatCard
          label="Dados de baja"
          value={assets?.written_off ?? 0}
          sub="fuera de servicio"
          icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          color="red"
        />
      </div>

      {/* Inventario mensual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Período abierto */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Auditoria actual
          </p>
          {inventory?.open_period ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {inventory.open_period.period_day} de {MONTHS[inventory.open_period.period_month]} {inventory.open_period.period_year}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inventory.open_period.reviewed} de {inventory.open_period.total} revisados
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Abierto
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${inventory.open_period.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {Math.round(inventory.open_period.percentage)}% completado
                </span>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Ir al inventario →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-slate-400">No hay inventario abierto este mes.</p>
              <button
                onClick={() => navigate('/inventory')}
                className="btn-primary text-xs px-4 py-2"
              >
                Abrir inventario
              </button>
            </div>
          )}
        </div>

        {/* Último período cerrado + total */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Historial de auditorias
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {inventory?.total_periods ?? 0}
                </p>
                <p className="text-xs text-slate-500">períodos registrados</p>
              </div>
              {inventory?.last_closed && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Último cerrado</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {inventory.last_closed.period_day} de {MONTHS[inventory.last_closed.period_month]} {inventory.last_closed.period_year}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Ver todos los períodos →
            </button>
          </div>
        </div>
      </div>

      {/* Distribución por categoría y ciudad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <DistributionCard
          title="Por categoría"
          items={cats}
          total={assets?.total ?? 0}
        />

        <DistributionCard
          title="Por ciudad"
          items={cities}
          total={assets?.total ?? 0}
        />

      </div>

    </div>
  )
}

// ── Componentes ───────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: {
  label: string
  value: number
  sub: string
  icon: string
  color: 'slate' | 'green' | 'yellow' | 'red'
}) {
  const colors = {
    slate: { bg: 'bg-slate-50 dark:bg-slate-800/50', icon: 'text-slate-400', val: 'text-slate-900 dark:text-white' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500', val: 'text-green-700 dark:text-green-300' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: 'text-yellow-500', val: 'text-yellow-700 dark:text-yellow-300' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-500', val: 'text-red-700 dark:text-red-300' },
  }
  const c = colors[color]

  return (
    <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className={`text-3xl font-extrabold ${c.val}`}>{value.toLocaleString('es-CO')}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function DistributionCard({ title, items, total }: {
  title: string
  items: (CategoryStat | CityStat)[]
  total: number
}) {
  const top5 = items.slice(0, 5)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
      <div className="space-y-3">
        {top5.map((item, i) => {
          const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[60%]">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {item.total} <span className="text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}