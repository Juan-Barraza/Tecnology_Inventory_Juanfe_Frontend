import api from '@/lib/axios'
import type { Area, AssetCategory, AccountingGroup, City } from '@/types/catalog.type'

export const catalogsApi = {
  getCities: async (): Promise<City[]> => {
    const res = await api.get('/catalogs/cities')
    return res.data.data
  },

  getAreas: async (): Promise<Area[]> => {
    const res = await api.get('/catalogs/areas')
    return res.data.data
  },

  getCategories: async (): Promise<AssetCategory[]> => {
    const res = await api.get('/catalogs/categories')
    return res.data.data
  },

  getAccountingGroups: async (): Promise<AccountingGroup[]> => {
    const res = await api.get('/catalogs/accounting-groups')
    return res.data.data
  },

  updateAccountingGroup: async (id: number, name: string): Promise<void> => {
    await api.patch(`/catalogs/accounting-groups/${id}`, { name })
  },
}
