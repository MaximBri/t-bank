import { api } from '@/shared/api/api.ts'
import { getErrorInfo } from '@/shared/api/helpers.ts'
import {
  AuthCredentials, ChangePasswordDto,
  CurrentUserDto,
  RegisterResponseDto, UserData,
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

  async updateProfile(newData: UserData) {
    const mappedData = {
      first_name: newData.firstName,
      second_name: newData.lastName,
    }
    await api.patch('/me', mappedData)
  },

  async changePassword(payload: ChangePasswordDto) {
    await api.post('/me/password', payload)
  },

  getErrorInfo,
}