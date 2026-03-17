import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '@/api/assets.api'
import { queryKeys } from './query-keys'
import type {
  AssetFilter,
  CreateAssetRequest,
  UpdateAssetRequest,
  UpdateAssetStatusRequest,
} from '@/types/asset.type'

export function useAssets(filters: AssetFilter) {
  return useQuery({
    queryKey: queryKeys.assets.list(filters),
    queryFn: () => assetsApi.getAll(filters),
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: queryKeys.assets.detail(id),
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  })
}

export function useAssetHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.assets.history(id),
    queryFn: () => assetsApi.getHistory(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetRequest) => assetsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.lists() }),
  })
}

export function useUpdateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      assetsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.assets.lists() })
      qc.invalidateQueries({ queryKey: queryKeys.assets.detail(id) })
    },
  })
}

export function useChangeAssetStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetStatusRequest }) =>
      assetsApi.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.assets.lists() })
      qc.invalidateQueries({ queryKey: queryKeys.assets.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.assets.history(id) })
    },
  })
}