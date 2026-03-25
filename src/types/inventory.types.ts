export type PeriodStatus = 'open' | 'closed'

export interface InventoryPeriod {
  id: string
  period_year: number
  period_month: number
  period_day: number
  status: PeriodStatus
  created_by: string
  closed_at: string | null
  created_at: string
}

export interface InventoryRecord {
  id: string
  period_id: string
  asset_id: string
  asset_code: string
  asset_description: string
  category_name: string
  city_name: string
  area_name: string | null
  logical_status: string
  confirmed: boolean
  deactivated: boolean
  has_label: boolean
  notes: string | null
  recorded_by_name: string
  recorded_at: string
}

export interface RecordAssetRequest {
  period_id: string
  asset_id: string
  confirmed: boolean
  deactivated: boolean
  has_label: boolean
  notes?: string
}

export interface PeriodProgress {
  total: number
  reviewed: number
  pending: number
  percentage: number
}


export interface AssetInventoryStatus {
  asset_id: string
  asset_code: string
  asset_description: string
  category_name: string
  city_name: string
  area_name: string | null
  // null si no fue revisado aún
  record_id: string | null
  confirmed: boolean | null
  deactivated: boolean | null
  has_label: boolean | null
  notes: string | null
  recorded_at: string | null
  activation_date: string | null
}