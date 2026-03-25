import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'
import { useAuthStore } from '@/store/auth.store'


export function useDashboard() {
    const user = useAuthStore((s) => s.user)
    return useQuery({
        queryKey: ['dashboard', user?.id],
        queryFn: dashboardApi.get,
        enabled: !!user?.id
    })
}