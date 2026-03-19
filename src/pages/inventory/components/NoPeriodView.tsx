import { useCreatePeriod } from '@/hooks/useInventory'
import { MONTHS } from '@/utils/constants'

export default function NoPeriodView() {
    const { mutate: createPeriod, isPending, error } = useCreatePeriod()

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    function handleOpen() {
        createPeriod({ year, month })
    }

    const serverError = (error as any)?.response?.data?.error

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    No hay Auditoria abierta
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Abre la Auditoria de <strong>{MONTHS[month]} {year}</strong> para comenzar
                    a registrar la revisión de activos.
                </p>
            </div>

            {serverError && (
                <p className="text-sm text-red-500">{'Periodo ya abierto'}</p>
            )}

            <button
                onClick={handleOpen}
                disabled={isPending}
                className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
            >
                {isPending
                    ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Abriendo...</>
                    : <>Abrir Auditoria de {MONTHS[month]} {year}</>
                }
            </button>
        </div>
    )
}