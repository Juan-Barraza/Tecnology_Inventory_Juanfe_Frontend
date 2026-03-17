import api from '@/lib/axios'
import type { LoginRequest, LoginResponse } from '@/types/auth.types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post('/auth/login', data)
    return res.data.data
  }
}
