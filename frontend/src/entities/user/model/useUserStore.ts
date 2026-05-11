import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { userApi } from '@/shared/api/user'
import { clearApiCache } from '@/shared/lib/clearApiCache'
import type { CurrentUserDto } from '@/shared/api/user/types'
import type { User, UserStore } from './types'

const mapCurrentUser = (payload: CurrentUserDto): User => ({
  id: payload.user_id,
  username: payload.login,
  login: payload.login,
  firstName: payload.first_name,
  lastName: payload.second_name,
  avatarUrl: payload.avatar_url,
})

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
      const user = mapCurrentUser(response)

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
      const user = mapCurrentUser(response)

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
      const user = mapCurrentUser(response)

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
