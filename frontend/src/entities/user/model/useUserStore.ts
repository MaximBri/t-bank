import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { clearApiCache } from '@/shared/lib/clearApiCache'
import { s3Api } from '@/shared/api/s3Api'
import type {
  ChangePasswordDto,
  CurrentUserDto,
  UpdateProfilePayload,
  User,
  UserStore,
} from './types'
import { userApi } from '..'

const mapCurrentUser = (payload: CurrentUserDto): User => ({
  id: payload.user_id,
  login: payload.login,
  firstName: payload.first_name,
  lastName: payload.second_name,
  avatarUrl: payload.avatar_url ?? undefined,
})

const withResolvedAvatar = async (user: User): Promise<User> => {
  if (!user.avatarUrl) {
    return user
  }

  try {
    const avatarUrl = await s3Api.getDownloadUrl(user.avatarUrl)
    return { ...user, avatarUrl }
  } catch {
    return { ...user, avatarUrl: undefined }
  }
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthResolved: false,
      isAuthenticated: false,
      isLoading: false,
  setUser: (user) =>
    set({
      user,
      isAuthResolved: true,
      isAuthenticated: Boolean(user),
    }),
  clearUser: () => {
    void clearApiCache()
    set({
      user: null,
      isAuthResolved: true,
      isAuthenticated: false,
      isLoading: false,
    })
  },
  fetchCurrentUser: async () => {
    set({ isLoading: true })

    try {
      const response = await userApi.me()
      const user = await withResolvedAvatar(mapCurrentUser(response))
      set({
        user,
        isAuthResolved: true,
        isAuthenticated: true,
        isLoading: false,
      })

      return user
    } catch {
      set({ isAuthResolved: true, isLoading: false })
      return null
    }
  },
  login: async (payload) => {
    set({ isLoading: true })

    try {
      await clearApiCache()
      await userApi.login(payload)
      const response = await userApi.me()
      const user = await withResolvedAvatar(mapCurrentUser(response))

      set({
        user,
        isAuthResolved: true,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      const info = userApi.getErrorInfo(error)
      const wrapped = new Error(info.message) as Error & { status?: number }
      wrapped.status = info.status
      throw wrapped
    }
  },
  register: async (payload) => {
    set({ isLoading: true })

    try {
      await clearApiCache()
      await userApi.register(payload)
      const response = await userApi.me()
      const user = await withResolvedAvatar(mapCurrentUser(response))

      set({
        user,
        isAuthResolved: true,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      const info = userApi.getErrorInfo(error)
      const wrapped = new Error(info.message) as Error & { status?: number }
      wrapped.status = info.status
      throw wrapped
    }
  },
  logout: async () => {
    set({ isLoading: true })

    try {
      await userApi.logout()
    } finally {
      await clearApiCache()
      set({
        user: null,
        isAuthResolved: true,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
  update: async (newData: UpdateProfilePayload) => {
    try {
      let avatarUrl: string | undefined
      if (newData.avatar) {
        avatarUrl = await s3Api.uploadFile(newData.avatar)
      }

      await userApi.updateProfile({
        firstName: newData.firstName,
        lastName: newData.lastName,
        avatarUrl,
      })
      const response = await userApi.me()
      const user = await withResolvedAvatar(mapCurrentUser(response))
      set({ user })
    } catch (error) {
      const info = userApi.getErrorInfo(error)
      const wrapped = new Error(info.message) as Error & { status?: number }
      wrapped.status = info.status
      throw wrapped
    }
  },
  changePassword: async (payload: ChangePasswordDto) => {
    try {
      await clearApiCache()
      await userApi.changePassword(payload)
    }
    catch (error) {
      const info = userApi.getErrorInfo(error)
      const wrapped = new Error(info.message) as Error & { status?: number }
      wrapped.status = info.status
      throw wrapped
    }
  }
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
