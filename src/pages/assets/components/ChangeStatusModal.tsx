import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useChangeAssetStatus } from '@/hooks/useAssets'
import type { LogicalStatus, PhysicalStatus } from '@/types/asset.type'
import { LOGICAL_STATUS_LABEL, PHYSICAL_STATUS_LABEL } from '@/utils/constants'

const schema = z.object({
    logical_status: z.enum(['active', 'inactive', 'written_off']).optional(),
    physical_status: z.enum(['optimal', 'good', 'fair', 'deteriorated', 'out_of_service']).optional(),
    notes: z.string().optional(),
})

type Form = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    assetId: string
    currentLogical: LogicalStatus
    currentPhysical: PhysicalStatus
}

const selectClass = 'w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer'
const inputClass = 'w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none'

export default function ChangeStatusModal({
    isOpen, onClose, assetId, currentLogical, currentPhysical,
}: Props) {
    const { mutate, isPending, error } = useChangeAssetStatus()

    const { register, handleSubmit, reset, watch } = useForm<Form>({
        defaultValues: {
            logical_status: currentLogical,
            physical_status: currentPhysical,
        },
    })

    if (!isOpen) return null

    const onSubmit = (data: Form) => {
        mutate(
            { id: assetId, data },
            { onSuccess: () => { reset(); onClose() } }
        )
    }

    const selectedLogical = watch('logical_status')
    const isWritingOff = selectedLogical === 'written_off'
    const serverError = (error as any)?.response?.data?.error

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">

                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Cambiar estado</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Actualiza el estado lógico o físico del activo.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
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

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Estado lógico
                        </label>
                        <div className="relative">
                            <select {...register('logical_status')} className={selectClass}>
                                {(['active', 'inactive', 'written_off'] as LogicalStatus[]).map(s => (
                                    <option key={s} value={s}>{LOGICAL_STATUS_LABEL[s]}</option>
                                ))}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Estado físico
                        </label>
                        <div className="relative">
                            <select {...register('physical_status')} className={selectClass}>
                                {(['optimal', 'good', 'fair', 'deteriorated', 'out_of_service'] as PhysicalStatus[]).map(s => (
                                    <option key={s} value={s}>{PHYSICAL_STATUS_LABEL[s]}</option>
                                ))}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Observación{isWritingOff && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            placeholder={isWritingOff ? 'Describe el motivo de la baja...' : 'Opcional...'}
                            className={inputClass}
                        />
                    </div>

                    {isWritingOff && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                            Al dar de baja, la asignación activa se cerrará automáticamente y quedará registrado en el historial.
                        </div>
                    )}

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
                            className="flex-1 py-2.5 text-sm btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending
                                ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Guardando...</>
                                : 'Guardar'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ChevronDown() {
    return (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </span>
    )
}