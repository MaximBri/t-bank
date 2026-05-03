import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { BACKEND_URL } from '@/shared/config'

type RetriableRequestConfig = InternalAxiosRequestConfig

let refreshRequest: Promise<void> | null = null

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401 || originalRequest._retry || originalRequest._skipAuthRefresh) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshRequest ??= axios
        .post('/auth/refresh', undefined, { withCredentials: true })
        .then(() => undefined)
        .finally(() => {
          refreshRequest = null
        })

      await refreshRequest

      return api(originalRequest)
    } catch (refreshError) {
      const { useUserStore } = await import('@/entities/user')
      useUserStore.getState().clearUser()

      return Promise.reject(refreshError)
    }
  },
)
