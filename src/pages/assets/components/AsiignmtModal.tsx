import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAssignment, useReleaseAssignment } from '@/hooks/useAssignments'
import { todayISO } from '@/utils/date'
import type { Assignment } from '@/types/assignment.type'

const assignSchema = z.object({
    responsible_name: z.string().optional(),
    responsible_position: z.string().optional(),
    assigned_at: z.string().min(1, 'La fecha es requerida'),
})

const releaseSchema = z.object({
    deactivated_at: z.string().min(1, 'La fecha es requerida'),
    deactivation_reason: z.string().optional(),
})

type AssignForm = z.infer<typeof assignSchema>
type ReleaseForm = z.infer<typeof releaseSchema>

interface Props {
    isOpen: boolean;
    onClose: () => void;
    assetId: string;
    activeAssignment: Assignment | undefined;
}

const inputClass = 'w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors'

export default function AssignmentModal({ isOpen, onClose, assetId, activeAssignment }: Props) {
    const isReleasing = !!activeAssignment

    const { mutate: createAssignment, isPending: creating, error: createError } = useCreateAssignment()
    const { mutate: releaseAssignment, isPending: releasing, error: releaseError } = useReleaseAssignment(assetId)

    const assignForm = useForm<AssignForm>({
        resolver: zodResolver(assignSchema),
        defaultValues: { assigned_at: todayISO() },
    })

    const releaseForm = useForm<ReleaseForm>({
        resolver: zodResolver(releaseSchema),
        defaultValues: { deactivated_at: todayISO() },
    })

    if (!isOpen) return null

    const isPending = creating || releasing
    const serverError =
        (createError as any)?.response?.data?.error ||
        (releaseError as any)?.response?.data?.error

    function onAssign(data: AssignForm) {
        createAssignment(
            { ...data, asset_id: assetId },
            { onSuccess: () => { assignForm.reset(); onClose() } }
        )
    }

    function onRelease(data: ReleaseForm) {
        if (!activeAssignment) return
        releaseAssignment(
            { id: activeAssignment.id, data },
            { onSuccess: () => { releaseForm.reset(); onClose() } }
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">

                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            {isReleasing ? 'Liberar asignación' : 'Asignar activo'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isReleasing
                                ? `Actualmente asignado a ${activeAssignment.responsible_name ?? 'Sin responsable'}`
                                : 'Asigna este activo a un responsable o área.'
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {serverError && (
                    <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600 text-sm">
                        {serverError}
                    </div>
                )}

                {/* Formulario de asignación */}
                {!isReleasing && (
                    <form onSubmit={assignForm.handleSubmit(onAssign)} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Responsable <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                            </label>
                            <input
                                {...assignForm.register('responsible_name')}
                                placeholder="Nombre del responsable"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Cargo <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                            </label>
                            <input
                                {...assignForm.register('responsible_position')}
                                placeholder="Cargo o rol"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Fecha de asignación
                            </label>
                            <input
                                {...assignForm.register('assigned_at')}
                                type="date"
                                className={inputClass}
                            />
                            {assignForm.formState.errors.assigned_at && (
                                <p className="mt-1 text-xs text-red-500">{assignForm.formState.errors.assigned_at.message}</p>
                            )}
                        </div>
                        <Buttons isPending={isPending} onClose={onClose} label="Asignar" />
                    </form>
                )}

                {/* Formulario de liberación */}
                {isReleasing && (
                    <form onSubmit={releaseForm.handleSubmit(onRelease)} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Fecha de liberación
                            </label>
                            <input
                                {...releaseForm.register('deactivated_at')}
                                type="date"
                                className={inputClass}
                            />
                            {releaseForm.formState.errors.deactivated_at && (
                                <p className="mt-1 text-xs text-red-500">{releaseForm.formState.errors.deactivated_at.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Motivo <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                            </label>
                            <textarea
                                {...releaseForm.register('deactivation_reason')}
                                rows={3}
                                placeholder="Motivo de la liberación..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                        <Buttons isPending={isPending} onClose={onClose} label="Liberar" danger />
                    </form>
                )}
            </div>
        </div>
    )
}

function Buttons({ isPending, onClose, label, danger }: {
    isPending: boolean
    onClose: () => void
    label: string
    danger?: boolean
}) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={isPending}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all ${danger
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'btn-primary'
                    }`}
            >
                {isPending
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{label}...</>
                    : label
                }
            </button>
        </div>
    )
}