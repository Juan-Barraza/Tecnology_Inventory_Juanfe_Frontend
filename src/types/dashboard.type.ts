export interface DashboardData {
    assets: AssetStats
    inventory: InventoryStats
    categories: CategoryStat[]
    cities: CityStat[]
}

export interface AssetStats {
    total: number
    active: number
    inactive: number
    written_off: number
}

export interface InventoryStats {
    open_period: OpenPeriodStat | null
    last_closed: ClosedPeriodStat | null
    total_periods: number
}

export interface OpenPeriodStat {
    id: string
    period_year: number
    period_month: number
    reviewed: number
    total: number
    percentage: number
}

export interface ClosedPeriodStat {
    period_year: number
    period_month: number
}

export interface CategoryStat {
    name: string
    total: number
}

export interface CityStat {
    name: string
    total: number
}