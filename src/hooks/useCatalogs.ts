import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogsApi } from '@/api/catalogs.api'
import { queryKeys } from './query-keys'

export function useCities() {
  return useQuery({
    queryKey: queryKeys.catalogs.cities(),
    queryFn: catalogsApi.getCities,
    staleTime: Infinity,
  })
}

export function useAreas() {
  return useQuery({
    queryKey: queryKeys.catalogs.areas(),
    queryFn: catalogsApi.getAreas,
    staleTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.catalogs.categories(),
    queryFn: catalogsApi.getCategories,
    staleTime: Infinity,
  })
}

export function useAccountingGroups() {
  return useQuery({
    queryKey: queryKeys.catalogs.accountingGroups(),
    queryFn: catalogsApi.getAccountingGroups,
    staleTime: Infinity,
  })
}

export function useUpdateAccountingGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      catalogsApi.updateAccountingGroup(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.catalogs.accountingGroups() }),
  })
}
