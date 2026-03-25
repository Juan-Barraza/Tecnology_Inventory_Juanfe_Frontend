import api from '@/lib/axios'
import type {
  InventoryPeriod,
  InventoryRecord,
  PeriodProgress,
  RecordAssetRequest,
  AssetInventoryStatus
} from '@/types/inventory.types'

export const inventoryApi = {
  getPeriods: async (): Promise<InventoryPeriod[]> => {
    const res = await api.get('/inventory/periods')
    return res.data.data
  },

  createPeriod: async (year: number, month: number, day: number): Promise<InventoryPeriod> => {
    const res = await api.post('/inventory/periods', {
      period_year: year,
      period_month: month,
      period_day: day,
    })
    return res.data.data
  },

  closePeriod: async (id: string): Promise<void> => {
    await api.patch(`/inventory/periods/${id}/close`)
  },

  getRecords: async (periodId: string): Promise<InventoryRecord[]> => {
    const res = await api.get(`/inventory/periods/${periodId}/records`)
    return res.data.data
  },

  getProgress: async (periodId: string): Promise<PeriodProgress> => {
    const res = await api.get(`/inventory/periods/${periodId}/progress`)
    return res.data.data
  },

  getPeriodAssets: async (periodId: string): Promise<AssetInventoryStatus[]> => {
    const res = await api.get(`/inventory/periods/${periodId}/assets`)
    return res.data.data ?? []
  },

  recordAsset: async (data: RecordAssetRequest): Promise<void> => {
    await api.post('/inventory/records', data)
  },
}
