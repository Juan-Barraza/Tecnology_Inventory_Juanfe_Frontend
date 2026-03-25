import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory.api'
import { queryKeys } from './query-keys'
import type { RecordAssetRequest } from '@/types/inventory.types'
import { useAuthStore } from '@/store/auth.store'

export function usePeriods() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).inventory.periods(),
    queryFn: inventoryApi.getPeriods,
  })
}

export function usePeriodRecords(periodId: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).inventory.records(periodId),
    queryFn: () => inventoryApi.getRecords(periodId),
    enabled: !!periodId,
  })
}

export function usePeriodProgress(periodId: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).inventory.progress(periodId),
    queryFn: () => inventoryApi.getProgress(periodId),
    enabled: !!periodId,
  })
}

export function useCreatePeriod() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month, day }: { year: number; month: number; day: number }) =>
      inventoryApi.createPeriod(year, month, day),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).inventory.periods() }),
  })
}

export function useClosePeriod() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryApi.closePeriod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).inventory.periods() }),
  })
}

export function useRecordAsset(periodId: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordAssetRequest) => inventoryApi.recordAsset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).inventory.records(periodId) })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).inventory.progress(periodId) })
    },
  })

}

export function usePeriodAssets(periodId: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  return useQuery({
    queryKey: queryKeys.userScope(userId).inventory.assets(periodId),
    queryFn: () => inventoryApi.getPeriodAssets(periodId),
    enabled: !!periodId,
  })
}