import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory.api'
import { queryKeys } from './query-keys'
import type { RecordAssetRequest } from '@/types/inventory.types'

export function usePeriods() {
  return useQuery({
    queryKey: queryKeys.inventory.periods(),
    queryFn: inventoryApi.getPeriods,
  })
}

export function usePeriodRecords(periodId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.records(periodId),
    queryFn: () => inventoryApi.getRecords(periodId),
    enabled: !!periodId,
  })
}

export function usePeriodProgress(periodId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.progress(periodId),
    queryFn: () => inventoryApi.getProgress(periodId),
    enabled: !!periodId,
  })
}

export function useCreatePeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      inventoryApi.createPeriod(year, month),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.periods() }),
  })
}

export function useClosePeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryApi.closePeriod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.periods() }),
  })
}

export function useRecordAsset(periodId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordAssetRequest) => inventoryApi.recordAsset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.records(periodId) })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.progress(periodId) })
    },
  })

}

export function usePeriodAssets(periodId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.assets(periodId),
    queryFn: () => inventoryApi.getPeriodAssets(periodId),
    enabled: !!periodId,
  })
}