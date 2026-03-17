import { MONTHS } from './constants'

export function formatDate(dateStr: string): string {
    if (!dateStr) return '—'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}

export function formatDateTime(dateStr: string): string {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatPeriod(year: number, month: number): string {
    return `${MONTHS[month]} ${year}`
}

export function todayISO(): string {
    return new Date().toISOString().split('T')[0]
}