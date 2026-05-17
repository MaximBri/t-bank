import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetNotifications } from '@/entities/notification/api/hooks/useGetNotifications'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockNotification = {
  id: 'notif-1',
  eventId: 'event-1',
  expenseId: null,
  title: 'Новый расход',
  message: 'Добавлен расход на 500₽',
  isRead: false,
  createdAt: '2026-06-01T10:00:00Z',
}

describe('useGetNotifications', () => {
  afterEach(() => {
    mock.reset()
  })

  it('возвращает уведомления и unreadCount', async () => {
    mock.onGet('/api/notifications').reply(200, {
      items: [mockNotification],
      unreadCount: 1,
    })

    const { result } = renderHook(() => useGetNotifications(true), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.unreadCount).toBe(1)
  })

  it('не выполняет запрос когда enabled=false', () => {
    const { result } = renderHook(() => useGetNotifications(false), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('возвращает пустой список', async () => {
    mock.onGet('/api/notifications').reply(200, { items: [], unreadCount: 0 })

    const { result } = renderHook(() => useGetNotifications(true), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(0)
    expect(result.current.data?.unreadCount).toBe(0)
  })
})
