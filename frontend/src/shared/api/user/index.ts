import { api } from '@/shared/api/api'
import type { AuthCredentials, CurrentUserDto, RegisterResponseDto } from './types'
import { getErrorMessage } from './helpers'

export const userApi = {
  async login(payload: AuthCredentials) {
    await api.post('/auth/login', payload, {
      _skipAuthRefresh: true,
    })
  },

  async register(payload: AuthCredentials) {
    const { data } = await api.post<RegisterResponseDto>('/auth/register', payload, {
      _skipAuthRefresh: true,
    })

    return data
  },

  async me() {
    const { data } = await api.get<CurrentUserDto>('/auth/me')
    return data
  },
  
  async logout() {
    await api.post('/auth/logout', undefined, {
      _skipAuthRefresh: true,
    })
  },
  getErrorMessage,
}
