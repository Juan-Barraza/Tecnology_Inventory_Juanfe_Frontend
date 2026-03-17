import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'

export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardApi.get,
        staleTime: 1000 * 60 * 2, // 2 min
    })
}