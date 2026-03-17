import api from '@/lib/axios'
import type { DashboardData } from '@/types/dashboard.type'

export const dashboardApi = {
    get: async (): Promise<DashboardData> => {
        const res = await api.get('/dashboard')
        return res.data.data
    },
}