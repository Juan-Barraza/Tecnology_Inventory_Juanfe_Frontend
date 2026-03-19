import { usePeriods } from '@/hooks/useInventory'

import NoPeriodView from './components/NoPeriodView'
import OpenPeriodView from './components/OpenPeriodView'
import ClosedPeriodsTable from './components/ClosedPeriodsTable'

export default function InventoryPage() {
    const { data: periods = [], isLoading } = usePeriods()

    const openPeriod = periods.find(p => p.status === 'open')
    const closedPeriods = periods.filter(p => p.status === 'closed')

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Cargando inventario...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Auditoria
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control de activos tecnológicos
                </p>
            </div>

            {openPeriod
                ? <OpenPeriodView period={openPeriod} />
                : <NoPeriodView />
            }

            {closedPeriods.length > 0 && (
                <ClosedPeriodsTable periods={closedPeriods} />
            )}
        </div>
    )
}