export interface City {
    id: number
    name: string
    department: string
}

export interface Area {
    id: number
    name: string
    description: string | null
}

export interface AssetCategory {
    id: number
    name: string
}

export interface AssetAccountItem {
    id: number
    account_code: number
    open_ledger: string | null
}

export interface AccountingGroup {
    id: number
    code: number
    name: string
    accounts: AssetAccountItem[]
}