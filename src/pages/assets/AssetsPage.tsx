import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssets } from '@/hooks/useAssets'
import { useDebounce } from '@/hooks/useDebounce'
import AddAssetModal from './components/AddAssetModal'
import type { AssetFilter, LogicalStatus } from '@/types/asset.type'
import { LOGICAL_STATUS_LABEL, LOGICAL_STATUS_COLOR } from '@/utils/constants'
import { formatDate } from '@/utils/date'

export default function AssetsPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AssetFilter>({
    page: 1,
    limit: 10,
    logical_status: 'active',
  })

  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading, isError } = useAssets({
    ...filters,
    search: debouncedSearch || undefined,
  })

  const assets = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  function handlePageChange(page: number) {
    setFilters(prev => ({ ...prev, page }))
  }

  function handleStatusFilter(status: LogicalStatus | undefined) {
    setFilters(prev => ({ ...prev, logical_status: status, page: 1 }))
  }

  function clearFilters() {
    setSearch('')
    setFilters({ page: 1, limit: 10 })
  }

  const hasActiveFilters = !!filters.logical_status || !!debouncedSearch

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Activos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLoading ? 'Cargando...' : (
              <><span className="font-semibold text-slate-900 dark:text-slate-200">{total}</span> activos registrados</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Exportar XLSX</span>
            <span className="sm:hidden">Exportar</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary h-10 px-4 sm:px-6"
          >
            <span className="hidden sm:inline">+ Nuevo Activo</span>
            <span className="sm:hidden">+ Nuevo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código o descripción..."
          className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
        />

        <div className="relative">
          <select
            value={filters.logical_status ?? ''}
            onChange={e => handleStatusFilter((e.target.value as LogicalStatus) || undefined)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="written_off">Dado de baja</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-bold text-accent uppercase tracking-wider px-2 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Código', 'Descripción', 'Categoría', 'F. Activación', 'Estado'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      Cargando activos...
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-red-500 text-sm">
                    Error al cargar los activos.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No se encontraron activos con los filtros aplicados.
                  </td>
                </tr>
              )}
              {!isLoading && assets.map(asset => (
                <tr
                  key={asset.id}
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                      {asset.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-sm text-slate-800 dark:text-slate-200 group-hover:text-accent transition-colors line-clamp-1">
                      {asset.description}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{asset.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{formatDate(asset.activation_date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest whitespace-nowrap ${LOGICAL_STATUS_COLOR[asset.logical_status]}`}>
                      {LOGICAL_STATUS_LABEL[asset.logical_status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={filters.page!}
          limit={filters.limit!}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Cards — móvil */}
      <div className="md:hidden space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            Cargando activos...
          </div>
        )}
        {isError && (
          <p className="text-center text-red-500 text-sm py-8">
            Error al cargar los activos.
          </p>
        )}
        {!isLoading && !isError && assets.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            No se encontraron activos.
          </p>
        )}
        {!isLoading && assets.map(asset => (
          <div
            key={asset.id}
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start justify-between gap-3 cursor-pointer hover:border-accent/40 transition-colors"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {asset.code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest ${LOGICAL_STATUS_COLOR[asset.logical_status]}`}>
                  {LOGICAL_STATUS_LABEL[asset.logical_status]}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {asset.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{asset.category}</span>
                <span>·</span>
                <span>{asset.city}</span>
                {asset.area && <><span>·</span><span>{asset.area}</span></>}
                <span>·</span>
                <span>{formatDate(asset.activation_date)}</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}

        {!isLoading && total > 0 && (
          <Pagination
            page={filters.page!}
            limit={filters.limit!}
            total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, limit, total, totalPages, onPageChange }: PaginationProps) {
  // Ventana deslizante de 5 páginas centrada en la página actual
  const getPageNumbers = () => {
    const delta = 2 // páginas a cada lado de la actual
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    // Ajustar si estamos cerca del inicio o del final
    const pages: number[] = []
    for (let i = left; i <= right; i++) {
      pages.push(i)
    }

    // Rellenar hasta 5 si hay espacio
    while (pages.length < 5 && pages[0] > 1) {
      pages.unshift(pages[0] - 1)
    }
    while (pages.length < 5 && pages[pages.length - 1] < totalPages) {
      pages.push(pages[pages.length - 1] + 1)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const showLeftEllipsis = pageNumbers[0] > 1
  const showRightEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages

  return (
    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs font-medium text-slate-400">
        Mostrando {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total}
      </p>

      <div className="flex items-center gap-1.5">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Primera página + ellipsis */}
        {showLeftEllipsis && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              1
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">
              …
            </span>
          </>
        )}

        {/* Ventana de páginas */}
        {pageNumbers.map(p => (
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

        {/* Ellipsis + última página */}
        {showRightEllipsis && (
          <>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">
              …
            </span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Siguiente */}
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