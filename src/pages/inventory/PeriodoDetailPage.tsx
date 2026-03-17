import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { usePeriodAssets } from '@/hooks/useInventory'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory.api'
import { queryKeys } from '@/hooks/query-keys'
import { MONTHS } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'

const LIMIT = 10

export default function PeriodDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const { data: period, isLoading: loadingPeriod } = useQuery({
        queryKey: queryKeys.inventory.periods(),
        queryFn: inventoryApi.getPeriods,
        select: (periods) => periods.find(p => p.id === id),
    })

    const { data: assets = [], isLoading: loadingAssets } = usePeriodAssets(id!)

    const filtered = useMemo(() => {
        if (!search) return assets
        const q = search.toLowerCase()
        return assets.filter(a =>
            a.asset_code.toLowerCase().includes(q) ||
            a.asset_description.toLowerCase().includes(q)
        )
    }, [assets, search])

    const totalPages = Math.ceil(filtered.length / LIMIT)
    const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

    const confirmed = assets.filter(a => a.record_id && !a.deactivated).length
    const deactivated = assets.filter(a => a.deactivated).length
    const pending = assets.filter(a => !a.record_id).length

    if (loadingPeriod || loadingAssets) {
        return (
            <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Cargando período...
            </div>
        )
    }

    if (!period) {
        return (
            <div className="text-center py-32">
                <p className="text-slate-400 mb-4">Período no encontrado.</p>
                <button onClick={() => navigate('/inventory')} className="btn-primary px-6 py-2">
                    Volver
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <button onClick={() => navigate('/inventory')} className="hover:text-accent transition-colors">
                    Inventario
                </button>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {MONTHS[period.period_month]} {period.period_year}
                </span>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                Cerrado
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {MONTHS[period.period_month]} {period.period_year}
                            </h2>
                        </div>
                        {period.closed_at && (
                            <p className="text-xs text-slate-400">
                                Cerrado el {formatDateTime(period.closed_at)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total activos" value={assets.length} color="slate" />
                    <StatCard label="Confirmados" value={confirmed} color="green" />
                    <StatCard label="Dados de baja" value={deactivated} color="red" />
                    <StatCard label="Sin revisar" value={pending} color="yellow" />
                </div>
            </div>

            {/* Buscador */}
            <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por código o descripción..."
                className="w-full sm:w-72 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
            />

            {/* Tabla — desktop */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['Código', 'Descripción', 'Categoría', 'Ciudad', 'Estado revisión'].map(h => (
                                <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">
                                    No se encontraron activos.
                                </td>
                            </tr>
                        ) : paginated.map(item => (
                            <tr key={item.asset_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => navigate(`/assets/${item.asset_id}`)}
                                        className="font-mono text-sm font-bold text-accent hover:underline"
                                    >
                                        {item.asset_code}
                                    </button>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                        {item.asset_description}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">{item.category_name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">{item.city_name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge item={item} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <SimplePagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onPageChange={setPage} />
                )}
            </div>

            {/* Cards — móvil */}
            <div className="md:hidden space-y-3">
                {paginated.map(item => (
                    <div
                        key={item.asset_id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
                    >
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <button
                                onClick={() => navigate(`/assets/${item.asset_id}`)}
                                className="font-mono text-xs font-bold text-accent hover:underline"
                            >
                                {item.asset_code}
                            </button>
                            <StatusBadge item={item} />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {item.asset_description}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {item.category_name} · {item.city_name}
                            {item.area_name && ` · ${item.area_name}`}
                        </p>
                    </div>
                ))}

                {totalPages > 1 && (
                    <SimplePagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onPageChange={setPage} />
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'slate' | 'green' | 'red' | 'yellow' }) {
    const colors = {
        slate: 'bg-slate-50  dark:bg-slate-800/50  text-slate-700  dark:text-slate-300',
        green: 'bg-green-50  dark:bg-green-900/20  text-green-700  dark:text-green-400',
        red: 'bg-red-50    dark:bg-red-900/20    text-red-700    dark:text-red-400',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    }
    return (
        <div className={`${colors[color]} rounded-xl p-4`}>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
        </div>
    )
}

function StatusBadge({ item }: { item: { record_id: string | null; confirmed: boolean | null; deactivated: boolean | null } }) {
    if (!item.record_id) {
        return (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                Sin revisar
            </span>
        )
    }
    if (item.deactivated) {
        return (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                Dado de baja
            </span>
        )
    }
    return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            Confirmado
        </span>
    )
}

function SimplePagination({ page, totalPages, total, limit, onPageChange }: { page: number; totalPages: number; total: number; limit: number; onPageChange: (p: number) => void }) {
    return (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400">
                {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${page === p ? 'bg-accent text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}