export type LogicalStatus = 'active' | 'inactive' | 'written_off'
export type PhysicalStatus = 'optimal' | 'good' | 'fair' | 'deteriorated' | 'out_of_service'

export interface Asset {
    id: string
    code: string
    description: string
    category: string
    accounting_group_name: string
    accounting_group_code: number
    account_code: number
    open_ledger: string | null
    city: string
    area: string | null
    historical_cost: number | null
    activation_date: string
    logical_status: LogicalStatus
    physical_status: PhysicalStatus
    created_at: string
    updated_at: string
}

export interface CreateAssetRequest {
    code: string
    description: string
    category_id: number
    asset_account_id: number
    city_id: number
    area_id: number | null
    historical_cost: number | null
    activation_date: string
    physical_status: PhysicalStatus
}

export interface UpdateAssetRequest {
    description?: string
    category_id?: number
    asset_account_id?: number
    city_id?: number
    area_id?: number | null
    historical_cost?: number | null
    physical_status?: PhysicalStatus
}

export interface UpdateAssetStatusRequest {
    logical_status?: LogicalStatus
    physical_status?: PhysicalStatus
    notes?: string
}

export interface AssetFilter {
    city_id?: number
    area_id?: number
    category_id?: number
    asset_account_id?: number
    logical_status?: LogicalStatus
    physical_status?: PhysicalStatus
    from?: string
    to?: string
    search?: string
    page?: number
    limit?: number
}

export interface PaginatedAssets {
    items: Asset[]
    total: number
    page: number
    limit: number
    total_pages: number
}

export interface StatusHistoryResponse {
    id: string
    asset_id: string
    previous_status: string | null
    new_status: string
    notes: string | null
    recorded_by: string
    recorded_by_name: string
    created_at: string
}
