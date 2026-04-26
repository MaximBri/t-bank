import { create } from 'zustand'

import { userApi } from '@/shared/api/user'
import type { User, UserStore } from './types'

const mapCurrentUser = (payload: { userId: string; username: string }): User => ({
  id: payload.userId,
  username: payload.username,
})

export const useUserStore = create<UserStore>()((set) => ({
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
  clearUser: () =>
    set({
      user: null,
      isAuthResolved: true,
      isAuthenticated: false,
      isLoading: false,
    }),
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
      set({
        user: null,
        isAuthResolved: true,
        isAuthenticated: false,
        isLoading: false,
      })

      return null
    }
  },
  login: async (payload) => {
    set({ isLoading: true })

    try {
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
      throw new Error(userApi.getErrorMessage(error))
    }
  },
  register: async (payload) => {
    set({ isLoading: true })

    try {
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
      throw new Error(userApi.getErrorMessage(error))
    }
  },
  logout: async () => {
    set({ isLoading: true })

    try {
      await userApi.logout()
    } finally {
      set({
        user: null,
        isAuthResolved: true,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
