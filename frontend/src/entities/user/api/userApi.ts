import { api } from '@/shared/api/api.ts'
import { getErrorInfo } from '@/shared/api/helpers.ts'
import {
  AuthCredentials,
  CurrentUserDto,
  RegisterResponseDto,
  UpdateProfileDto,
  UserProfileDto,
} from '../model/types.ts'

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

  async updateUser(payload: UpdateProfileDto) {
    const { data } = await api.patch<UserProfileDto>('/me', payload)
    return data
  },

  getErrorInfo,
}