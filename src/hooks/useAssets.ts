import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '@/api/assets.api'
import { queryKeys } from './query-keys'
import type {
  AssetFilter,
  CreateAssetRequest,
  UpdateAssetRequest,
  UpdateAssetStatusRequest,
} from '@/types/asset.type'
import { useAuthStore } from '@/store/auth.store'

export function useAssets(filters: AssetFilter) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).assets.list(filters),
    queryFn: () => assetsApi.getAll(filters),
  })
}

export function useAsset(id: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).assets.detail(id),
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  })
}

export function useAssetHistory(id: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).assets.history(id),
    queryFn: () => assetsApi.getHistory(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetRequest) => assetsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.lists() }),
  })
}

export function useUpdateAsset() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      assetsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.lists() })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.detail(id) })
    },
  })
}

export function useChangeAssetStatus() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetStatusRequest }) =>
      assetsApi.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.lists() })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.history(id) })
    },
  })
}