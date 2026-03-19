import { useState, useMemo } from 'react'
import { useClosePeriod, usePeriodProgress, useRecordAsset, usePeriodAssets } from '@/hooks/useInventory'
import { MONTHS } from '@/utils/constants'
import type { InventoryPeriod, AssetInventoryStatus } from '@/types/inventory.types'
import { useNavigate } from 'react-router-dom'

interface Props {
    period: InventoryPeriod
}

export default function OpenPeriodView({ period }: Props) {
    const { data: assets = [], isLoading } = usePeriodAssets(period.id)
    const { data: progress } = usePeriodProgress(period.id)
    const { mutate: closePeriod, isPending: closing } = useClosePeriod()
    const { mutate: recordAsset } = useRecordAsset(period.id)
    const [confirmClose, setConfirmClose] = useState(false)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const LIMIT = 20
    const navigate = useNavigate()


    // Optimistic state — refleja cambios inmediatamente sin esperar el servidor
    const [optimisticMap, setOptimisticMap] = useState<Map<string, { confirmed: boolean; deactivated: boolean; has_label: boolean, record_id: string }>>(new Map())

    // Merge assets con el estado optimista
    const mergedAssets = useMemo(() => {
        return assets.map(a => {
            const opt = optimisticMap.get(a.asset_id)
            if (!opt) return a
            return {
                ...a,
                record_id: opt.record_id,
                confirmed: opt.confirmed,
                deactivated: opt.deactivated,
                has_label: opt.has_label,
            }
        })
    }, [assets, optimisticMap])

    // Filtrado + paginación
    const filtered = useMemo(() => {
        return mergedAssets.filter(a => {
            // Búsqueda por texto
            if (search) {
                const q = search.toLowerCase()
                if (
                    !a.asset_code.toLowerCase().includes(q) &&
                    !a.asset_description.toLowerCase().includes(q)
                ) return false
            }
            // Filtro por fecha de activación (client-side)
            if (filterFrom && a.activation_date) {
                if (a.activation_date < filterFrom) return false
            }
            if (filterTo && a.activation_date) {
                if (a.activation_date > filterTo) return false
            }
            return true
        })
    }, [mergedAssets, search, filterFrom, filterTo])

    const totalFiltered = filtered.length
    const totalPages = Math.ceil(totalFiltered / LIMIT)
    const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

    function handleSearch(value: string) {
        setSearch(value)
        setPage(1)
    }

    function handleFilterFrom(val: string) {
        setFilterFrom(val)
        setPage(1)
    }

    function handleFilterTo(val: string) {
        setFilterTo(val)
        setPage(1)
    }

    function clearFilters() {
        setSearch('')
        setFilterFrom('')
        setFilterTo('')
        setPage(1)
    }


    const hasFilters = !!search || !!filterFrom || !!filterTo

    function handleRecord(assetId: string, deactivated: boolean, hasLabel?: boolean) {
        // Optimistic update — actualiza inmediatamente la UI
        const current = optimisticMap.get(assetId)
        const currentHasLabel = hasLabel !== undefined
            ? hasLabel
            : current?.has_label ?? false
        setOptimisticMap(prev => {
            const next = new Map(prev)
            next.set(assetId, {
                record_id: assetId, // temporal — suficiente para saber que fue revisado
                confirmed: !deactivated,
                deactivated,
                has_label: currentHasLabel,
            })
            return next
        })

        recordAsset({
            period_id: period.id,
            asset_id: assetId,
            confirmed: !deactivated,
            deactivated,
            has_label: currentHasLabel,
        }, {
            onError: () => {
                // Revertir si falla
                setOptimisticMap(prev => {
                    const next = new Map(prev)
                    next.delete(assetId)
                    return next
                })
            },
        })
    }
    function handleToggleLabel(assetId: string, asset: AssetInventoryStatus) {
        const current = optimisticMap.get(assetId)
        const newLabel = !(current?.has_label ?? asset.has_label ?? false)
        const confirmed = current?.confirmed ?? (asset.confirmed ?? false)
        const deactivated = current?.deactivated ?? (asset.deactivated ?? false)

        setOptimisticMap(prev => {
            const next = new Map(prev)
            next.set(assetId, {
                record_id: assetId,
                confirmed,
                deactivated,
                has_label: newLabel,
            })
            return next
        })

        recordAsset({
            period_id: period.id,
            asset_id: assetId,
            confirmed,
            deactivated,
            has_label: newLabel,
        }, {
            onError: () => {
                setOptimisticMap(prev => {
                    const next = new Map(prev)
                    next.delete(assetId)
                    return next
                })
            },
        })
    }

    function handleClose() {
        closePeriod(period.id, {
            onSuccess: () => setConfirmClose(false),
        })
    }

    const percentage = progress?.percentage ?? 0
    const reviewed_count = progress?.reviewed ?? 0
    const total_count = progress?.total ?? 0
    const pending_count = progress?.pending ?? 0

    return (
        <div className="space-y-5">

            {/* Header del período */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            Abierto
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            {MONTHS[period.period_month]} {period.period_year}
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                        {reviewed_count} de {total_count} activos revisados · {pending_count} pendientes
                    </p>
                </div>
                <button
                    onClick={() => setConfirmClose(true)}
                    disabled={closing}
                    className="px-5 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-50 flex-shrink-0"
                >
                    Cerrar período
                </button>
            </div>

            {/* Barra de progreso */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Progreso de la Auditoria
                    </span>
                    <span className="text-sm font-bold text-accent">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {reviewed_count} confirmados
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        {pending_count} sin revisar
                    </span>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Búsqueda */}
                <input
                    type="text"
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Buscar por código o descripción..."
                    className="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
                />

                {/* Rango de fechas — client side */}
                <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Desde</label>
                    <input
                        type="date"
                        value={filterFrom}
                        onChange={e => handleFilterFrom(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Hasta</label>
                    <input
                        type="date"
                        value={filterTo}
                        onChange={e => handleFilterTo(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
                    />
                </div>

                {/* Info + limpiar */}
                {totalFiltered > 0 && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                        {totalFiltered} activos
                    </span>
                )}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs font-bold text-accent uppercase tracking-wider px-2 hover:underline"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Tabla — desktop */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['Código', 'Descripción', 'Categoría', 'Ciudad', 'Etiqueta', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex items-center justify-center gap-3 text-slate-400">
                                        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                        Cargando activos...
                                    </div>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                                    {search ? 'No se encontraron activos.' : 'No hay activos activos.'}
                                </td>
                            </tr>
                        ) : (
                            paginated.map(item => (
                                <tr key={item.asset_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/assets/${item.asset_id}`)}
                                            className="font-mono text-sm font-bold text-accent hover:underline transition-colors"
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
                                        <LabelCheckbox
                                            assetId={item.asset_id}
                                            asset={item}
                                            onToggle={handleToggleLabel}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <ReviewBadge asset={item} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <RecordActions
                                            assetId={item.asset_id}
                                            asset={item}
                                            onRecord={handleRecord}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {!isLoading && totalFiltered > LIMIT && (
                    <InlinePagination
                        page={page}
                        totalPages={totalPages}
                        total={totalFiltered}
                        limit={LIMIT}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {/* Cards — móvil */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
                        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        Cargando...
                    </div>
                ) : paginated.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">
                        {search ? 'No se encontraron activos.' : 'No hay activos activos.'}
                    </p>
                ) : (
                    paginated.map(asset => (
                        <div
                            key={asset.asset_id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs font-bold text-slate-500">
                                            {asset.asset_code}
                                        </span>
                                        <ReviewBadge asset={asset} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {asset.asset_description}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {asset.category_name} · {asset.city_name}
                                        {asset.area_name && ` · ${asset.area_name}`}
                                    </p>
                                </div>
                            </div>
                            <LabelCheckbox
                                assetId={asset.asset_id}
                                asset={asset}
                                onToggle={handleToggleLabel}
                            />
                            <RecordActions
                                assetId={asset.asset_id}
                                asset={asset}
                                onRecord={handleRecord}
                                fullWidth
                            />
                        </div>
                    ))
                )}

                {/* Paginación móvil */}
                {!isLoading && totalFiltered > LIMIT && (
                    <InlinePagination
                        page={page}
                        totalPages={totalPages}
                        total={totalFiltered}
                        limit={LIMIT}
                        onPageChange={setPage}
                    />
                )}
            </div>

            {confirmClose && (
                <ConfirmCloseModal
                    period={period}
                    pending={pending_count}
                    closing={closing}
                    onConfirm={handleClose}
                    onCancel={() => setConfirmClose(false)}
                />
            )}
        </div>
    )
}

// ── Badge ─────────────────────────────────────────────────────

function ReviewBadge({ asset }: { asset: AssetInventoryStatus }) {
    if (!asset.record_id) {
        return (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                Pendiente
            </span>
        )
    }
    if (asset.deactivated) {
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

// ── Acciones ──────────────────────────────────────────────────

interface RecordActionsProps {
    assetId: string
    asset: AssetInventoryStatus
    onRecord: (assetId: string, deactivated: boolean) => void
    fullWidth?: boolean
}

function RecordActions({ assetId, asset, onRecord, fullWidth }: RecordActionsProps) {
    const base = `flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${fullWidth ? 'flex-1' : ''}`

    if (asset.record_id && asset.confirmed && !asset.deactivated) {
        return (
            <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmado
                </span>
                <button
                    onClick={() => onRecord(assetId, true)}
                    className={`${base} text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800`}
                >
                    Dar de baja
                </button>
            </div>
        )
    }

    if (asset.record_id && asset.deactivated) {
        return (
            <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Dado de baja
                </span>
                <button
                    onClick={() => onRecord(assetId, false)}
                    className={`${base} text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-800`}
                >
                    Reactivar
                </button>
            </div>
        )
    }

    return (
        <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
            <button
                onClick={() => onRecord(assetId, false)}
                className={`${base} bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
            </button>
            <button
                onClick={() => onRecord(assetId, true)}
                className={`${base} bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Dar de baja
            </button>
        </div>
    )
}

interface LabelCheckboxProps {
    assetId: string
    asset: AssetInventoryStatus
    onToggle: (assetId: string, asset: AssetInventoryStatus) => void
}

function LabelCheckbox({ assetId, asset, onToggle }: LabelCheckboxProps) {
    const checked = asset.has_label ?? false
    return (
        <label className="flex items-center gap-2 cursor-pointer group w-fit">
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(assetId, asset)}
                    className="sr-only peer"
                />
                <div className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                    ${checked
                        ? 'bg-accent border-accent'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-accent/60'
                    }
                `}>
                    {checked && (
                        <svg className="w-2.5 h-2.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
            <span className={`text-xs font-medium transition-colors ${checked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                Tiene etiqueta
            </span>
        </label>
    )
}

// ── Paginación ────────────────────────────────────────────────

interface InlinePaginationProps {
    page: number
    totalPages: number
    total: number
    limit: number
    onPageChange: (p: number) => void
}

function InlinePagination({ page, totalPages, total, limit, onPageChange }: InlinePaginationProps) {
    const getPages = () => {
        const delta = 2
        const left = Math.max(1, page - delta)
        const right = Math.min(totalPages, page + delta)
        const pages: number[] = []
        for (let i = left; i <= right; i++) pages.push(i)
        while (pages.length < 5 && pages[0] > 1) pages.unshift(pages[0] - 1)
        while (pages.length < 5 && pages[pages.length - 1] < totalPages) pages.push(pages[pages.length - 1] + 1)
        return pages
    }

    const pages = getPages()
    const showLeftEllipsis = pages[0] > 1
    const showRightEllipsis = pages[pages.length - 1] < totalPages

    return (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs font-medium text-slate-400">
                Mostrando {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total}
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

                {showLeftEllipsis && (
                    <>
                        <button onClick={() => onPageChange(1)} className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">1</button>
                        <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
                    </>
                )}

                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${page === p
                            ? 'bg-accent text-slate-900'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {p}
                    </button>
                ))}

                {showRightEllipsis && (
                    <>
                        <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
                        <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{totalPages}</button>
                    </>
                )}

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

// ── Modal cierre ──────────────────────────────────────────────

interface ConfirmCloseProps {
    period: InventoryPeriod
    pending: number
    closing: boolean
    onConfirm: () => void
    onCancel: () => void
}

function ConfirmCloseModal({ period, pending, closing, onConfirm, onCancel }: ConfirmCloseProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">¿Cerrar inventario?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Estás cerrando el inventario de{' '}
                        <strong>{MONTHS[period.period_month]} {period.period_year}</strong>.
                        {pending > 0 && (
                            <span className="block mt-1 text-yellow-600 dark:text-yellow-400 font-medium">
                                ⚠ {pending} activos quedarán sin revisar.
                            </span>
                        )}
                        {' '}Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={closing} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={closing} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                        {closing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cerrando...</> : 'Cerrar período'}
                    </button>
                </div>
            </div>
        </div>
    )
}