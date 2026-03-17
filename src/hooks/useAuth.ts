import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import type { LoginRequest } from '@/types/auth.types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.token, res.user)
    },
  })
}


export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return logout
}
