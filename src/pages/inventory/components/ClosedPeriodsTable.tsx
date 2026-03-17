import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTHS } from '@/utils/constants'
import { formatDateTime } from '@/utils/date'
import type { InventoryPeriod } from '@/types/inventory.types'

interface Props {
    periods: InventoryPeriod[]
}

const LIMIT = 3

export default function ClosedPeriodsTable({ periods }: Props) {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)

    const totalPages = Math.ceil(periods.length / LIMIT)
    const paginated = periods.slice((page - 1) * LIMIT, page * LIMIT)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Períodos cerrados
                </h3>
                <span className="text-xs text-slate-400">{periods.length} en total</span>
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['Período', 'Cerrado el', 'Estado', ''].map((h, i) => (
                                <th key={i} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {paginated.map(p => (
                            <tr
                                key={p.id}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {MONTHS[p.period_month]} {p.period_year}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">
                                        {p.closed_at ? formatDateTime(p.closed_at) : '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                        Cerrado
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/inventory/periods/${p.id}`)}
                                        className="text-xs font-semibold text-accent hover:underline transition-colors"
                                    >
                                        Ver detalle →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Móvil */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map(p => (
                    <div
                        key={p.id}
                        className="px-5 py-4 flex items-center justify-between gap-3"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {MONTHS[p.period_month]} {p.period_year}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {p.closed_at ? formatDateTime(p.closed_at) : '—'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                Cerrado
                            </span>
                            <button
                                onClick={() => navigate(`/inventory/periods/${p.id}`)}
                                className="text-xs font-semibold text-accent hover:underline"
                            >
                                Ver →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-xs text-slate-400">
                        {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, periods.length)} de {periods.length}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${page === p
                                    ? 'bg-accent text-slate-900'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}