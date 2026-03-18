import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAsset, useAssetHistory } from '@/hooks/useAssets'
import { useAssignments } from '@/hooks/useAssignments'
import { LOGICAL_STATUS_LABEL, LOGICAL_STATUS_COLOR, PHYSICAL_STATUS_LABEL, PHYSICAL_STATUS_COLOR } from '@/utils/constants'
import { formatDate, formatDateTime } from '@/utils/date'
import AssignmentModal from './components/AsiignmtModal'
import ChangeStatusModal from './components/ChangeStatusModal'
import EditAssetModal from './components/EditAssetModel';


export default function AssetDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)


    const { data: asset, isLoading, isError } = useAsset(id!)
    const { data: assignments = [] } = useAssignments(id!)
    const { data: history = [] } = useAssetHistory(id!)

    const activeAssignment = assignments.find(a => a.status === 'active')

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Cargando activo...
            </div>
        )
    }

    if (isError || !asset) {
        return (
            <div className="text-center py-32">
                <p className="text-slate-400 mb-4">No se encontró el activo.</p>
                <button onClick={() => navigate('/assets')} className="btn-primary px-6 py-2">
                    Volver
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Breadcrumb + acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button
                        onClick={() => navigate('/assets')}
                        className="hover:text-accent transition-colors"
                    >
                        Activos
                    </button>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {asset.code}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => setStatusModalOpen(true)}
                        className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        Cambiar estado
                    </button>
                    <button
                        onClick={() => setAssignModalOpen(true)}
                        className="btn-primary px-4 py-2 text-sm"
                    >
                        {activeAssignment ? 'Reasignar' : 'Asignar'}
                    </button>
                </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Col izquierda — info + estados */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Info general */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                    {asset.code}
                                </span>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                                    {asset.description}
                                </h2>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${LOGICAL_STATUS_COLOR[asset.logical_status]}`}>
                                    {LOGICAL_STATUS_LABEL[asset.logical_status]}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${PHYSICAL_STATUS_COLOR[asset.physical_status]}`}>
                                    {PHYSICAL_STATUS_LABEL[asset.physical_status]}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <InfoField label="Categoría" value={asset.category} />
                            <InfoField label="Ciudad" value={asset.city} />
                            <InfoField label="Área" value={asset.area ?? '—'} />
                            <InfoField label="Fecha activación" value={formatDate(asset.activation_date)} />
                            <InfoField
                                label="Costo histórico"
                                value={asset.historical_cost
                                    ? `$${asset.historical_cost.toLocaleString('es-CO')}`
                                    : '—'
                                }
                            />
                            <InfoField label="Grupo contable" value={asset.accounting_group_name} />
                            <InfoField label="Subcuenta" value={String(asset.account_code)} mono />
                            <InfoField label="Open ledger" value={asset.open_ledger ?? '—'} />
                            <InfoField label="Registrado" value={formatDateTime(asset.created_at)} />
                        </div>
                    </div>

                    {/* Asignación actual */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                            Asignación actual
                        </h3>

                        {activeAssignment ? (
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {activeAssignment.responsible_name ?? 'Sin responsable nominal'}
                                    </p>
                                    {activeAssignment.responsible_position && (
                                        <p className="text-sm text-slate-500">{activeAssignment.responsible_position}</p>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        Desde {formatDate(activeAssignment.assigned_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 flex-shrink-0"
                                >
                                    Liberar
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">Sin asignación activa.</p>
                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="text-xs font-semibold text-accent hover:underline"
                                >
                                    Asignar ahora
                                </button>
                            </div>
                        )}

                        {/* Historial de asignaciones */}
                        {assignments.filter(a => a.status !== 'active').length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Asignaciones anteriores
                                </p>
                                {assignments
                                    .filter(a => a.status !== 'active')
                                    .slice(0, 3)
                                    .map(a => (
                                        <div key={a.id} className="flex items-center justify-between text-sm">
                                            <div>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {a.responsible_name ?? 'Sin responsable'}
                                                </span>
                                                <span className="text-slate-400 ml-2 text-xs">
                                                    {formatDate(a.assigned_at)} → {a.deactivated_at ? formatDate(a.deactivated_at) : '—'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400 capitalize">{a.status}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* Col derecha — historial */}
                <div className="space-y-6">

                    {/* Historial de estados */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                            Historial de estados
                        </h3>

                        {history.length === 0 ? (
                            <p className="text-sm text-slate-400">Sin cambios registrados.</p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <div key={h.id} className="flex gap-3">
                                        {/* Línea de tiempo */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${h.new_status === 'active' ? 'bg-green-500' :
                                                h.new_status === 'written_off' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                                }`} />
                                            {i < history.length - 1 && (
                                                <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
                                            )}
                                        </div>
                                        <div className="pb-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {h.previous_status && (
                                                    <>
                                                        <span className="text-xs font-semibold text-slate-400">
                                                            {LOGICAL_STATUS_LABEL[h.previous_status as keyof typeof LOGICAL_STATUS_LABEL]}
                                                        </span>
                                                        <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </>
                                                )}
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${LOGICAL_STATUS_COLOR[h.new_status as keyof typeof LOGICAL_STATUS_COLOR]}`}>
                                                    {LOGICAL_STATUS_LABEL[h.new_status as keyof typeof LOGICAL_STATUS_LABEL]}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatDateTime(h.created_at)} · {h.recorded_by_name}
                                            </p>
                                            {h.notes && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                                                    "{h.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <AssignmentModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                assetId={id!}
                activeAssignment={activeAssignment}
            />
            <ChangeStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                assetId={id!}
                currentLogical={asset.logical_status}
                currentPhysical={asset.physical_status}
            />
            {asset && (
                <EditAssetModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    asset={asset}
                />
            )}
        </div>
    )
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-sm font-medium text-slate-800 dark:text-slate-200 ${mono ? 'font-mono' : ''}`}>
                {value}
            </p>
        </div>
    )
}