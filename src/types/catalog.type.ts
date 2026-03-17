export interface City {
    ID: number
    Name: string
    Department: string
}

export interface Area {
    ID: number
    Name: string
    Description: string | null
}

export interface AssetCategory {
    ID: number
    Name: string
}

export interface AssetAccountItem {
    ID: number
    account_code: number
    open_ledger: string | null
}

export interface AccountingGroup {
    id: number
    code: number
    name: string
    accounts: AssetAccountItem[]
}