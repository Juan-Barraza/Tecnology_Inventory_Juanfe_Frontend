import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignmentsApi } from '@/api/assignments.api'
import { queryKeys } from './query-keys'
import type {
  CreateAssignmentRequest,
  ReleaseAssignmentRequest,
} from '@/types/assignment.type'
import { useAuthStore } from '@/store/auth.store'


export function useAssignments(assetId: string) {
  return useQuery({
    queryKey: queryKeys.assignments.byAsset(assetId),
    queryFn: () => assignmentsApi.getByAsset(assetId),
    enabled: !!assetId,
  })
}

export function useCreateAssignment() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignmentsApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.byAsset(vars.asset_id) })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.lists() })
    },
  })
}

export function useReleaseAssignment(assetId: string) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReleaseAssignmentRequest }) =>
      assignmentsApi.release(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments.byAsset(assetId) })
      qc.invalidateQueries({ queryKey: queryKeys.userScope(userId).assets.detail(assetId) })
    },
  })
}