import api from '@/lib/axios'
import type {
  Assignment,
  CreateAssignmentRequest,
  ReleaseAssignmentRequest,
} from '@/types/assignment.type'

export const assignmentsApi = {
  getByAsset: async (assetId: string): Promise<Assignment[]> => {
    const res = await api.get(`/assets/${assetId}/assignments`)
    return res.data.data ?? []
  },

  create: async (data: CreateAssignmentRequest): Promise<Assignment> => {
    const res = await api.post('/assignments', data)
    return res.data.data ?? []
  },

  release: async (id: string, data: ReleaseAssignmentRequest): Promise<void> => {
    await api.patch(`/assignments/${id}/release`, data)
  },
}
