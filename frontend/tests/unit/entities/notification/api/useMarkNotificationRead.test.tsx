import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/api/api'
import { useMarkNotificationRead } from '@/entities/notification/api/hooks/useMarkNotificationRead'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: 0, gcTime: 0 },
      mutations: { retry: 0 },
    },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useMarkNotificationRead', () => {
  afterEach(() => {
    mock.reset()
    vi.clearAllMocks()
  })

  it('успешно отмечает уведомление как прочитанное', async () => {
    mock.onPatch('/api/notifications/notif-1/read').reply(200)

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })

    await act(async () => {
      result.current.mutate('notif-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('отправляет PATCH на корректный URL с нужным id', async () => {
    const patchedUrls: string[] = []

    mock.onPatch('/api/notifications/notif-42/read').reply((config) => {
      patchedUrls.push(config.url ?? '')
      return [200]
    })

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })

    await act(async () => {
      result.current.mutate('notif-42')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(patchedUrls).toContain('/notifications/notif-42/read')
  })

  it('возвращает isError при ошибке сервера', async () => {
    mock.onPatch('/api/notifications/notif-err/read').reply(500)

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })

    await act(async () => {
      result.current.mutate('notif-err')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('возвращает isError при ошибке 404', async () => {
    mock.onPatch('/api/notifications/notif-missing/read').reply(404)

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })

    await act(async () => {
      result.current.mutate('notif-missing')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
