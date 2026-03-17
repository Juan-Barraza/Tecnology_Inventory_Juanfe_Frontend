import type { LogicalStatus, PhysicalStatus } from './../types/asset.type'

export const LOGICAL_STATUS_LABEL: Record<LogicalStatus, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    written_off: 'Dado de baja',
}

export const PHYSICAL_STATUS_LABEL: Record<PhysicalStatus, string> = {
    optimal: 'Óptimo',
    good: 'Bueno',
    fair: 'Regular',
    deteriorated: 'Deteriorado',
    out_of_service: 'Fuera de servicio',
}

export const LOGICAL_STATUS_COLOR: Record<LogicalStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    written_off: 'bg-red-100 text-red-800',
}

export const PHYSICAL_STATUS_COLOR: Record<PhysicalStatus, string> = {
    optimal: 'bg-blue-100 text-blue-800',
    good: 'bg-green-100 text-green-800',
    fair: 'bg-yellow-100 text-yellow-800',
    deteriorated: 'bg-orange-100 text-orange-800',
    out_of_service: 'bg-red-100 text-red-800',
}

export const MONTHS: Record<number, string> = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
}