import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { clearApiCache } from '@/shared/lib/clearApiCache'
import { s3Api } from '@/shared/api/s3Api'
import type {
  CurrentUserDto,
  User,
  UserProfileDto,
  UserStore,
} from './types'
import { userApi } from '..'

const mapCurrentUser = (payload: CurrentUserDto): User => ({
  id: payload.user_id,
  login: payload.login,
  firstName: payload.first_name,
  lastName: payload.second_name,
  avatarUrl: payload.avatar_url,
  avatarPreviewUrl: null,
})

const mapUserProfile = (payload: UserProfileDto): User => ({
  id: payload.id,
  login: payload.login,
  firstName: payload.first_name,
  lastName: payload.second_name,
  avatarUrl: payload.avatar_url,
  avatarPreviewUrl: null,
})

const withResolvedAvatar = async (user: User): Promise<User> => {
  if (!user.avatarUrl) {
    return user
  }

  try {
    const avatarPreviewUrl = await s3Api.getDownloadUrl(user.avatarUrl)
    return { ...user, avatarPreviewUrl }
  } catch {
    return user
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
  updateProfile: async ({ firstName, lastName, login, avatar }) => {
    set({ isLoading: true })

    try {
      let avatarKey: string | undefined
      if (avatar) {
        avatarKey = await s3Api.uploadFile(avatar)
      }

      const response = await userApi.updateUser({
        first_name: firstName,
        second_name: lastName,
        login,
        avatar_url: avatarKey,
      })

      const user = await withResolvedAvatar(mapUserProfile(response))

      set({
        user,
        isAuthResolved: true,
        isAuthenticated: true,
        isLoading: false,
      })

      return user
    } catch (error) {
      set({ isLoading: false })
      const info = userApi.getErrorInfo(error)
      const wrapped = new Error(info.message) as Error & { status?: number }
      wrapped.status = info.status
      throw wrapped
    }
  },
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
