import api from '@/lib/axios'
import type {
  Asset,
  AssetFilter,
  CreateAssetRequest,
  PaginatedAssets,
  UpdateAssetRequest,
  UpdateAssetStatusRequest,
  StatusHistoryResponse,
} from '@/types/asset.type'

export const assetsApi = {
  getAll: async (filters: AssetFilter): Promise<PaginatedAssets> => {
    const res = await api.get('/assets', { params: filters })
    return res.data.data ?? []
  },

  getById: async (id: string): Promise<Asset> => {
    const res = await api.get(`/assets/${id}`)
    return res.data.data
  },

  create: async (data: CreateAssetRequest): Promise<Asset> => {
    const res = await api.post('/assets', data)
    return res.data.data
  },

  update: async (id: string, data: UpdateAssetRequest): Promise<Asset> => {
    const res = await api.put(`/assets/${id}`, data)
    return res.data.data
  },

  changeStatus: async (id: string, data: UpdateAssetStatusRequest): Promise<Asset> => {
    const res = await api.patch(`/assets/${id}/status`, data)
    return res.data.data
  },

  getHistory: async (id: string): Promise<StatusHistoryResponse[]> => {
    const res = await api.get(`/assets/${id}/history`)
    return res.data.data ?? []
  },
}
