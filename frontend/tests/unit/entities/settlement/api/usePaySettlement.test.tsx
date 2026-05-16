import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/api/api'
import { usePaySettlement } from '@/entities/settlement/api/hooks/usePaySettlement'

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

describe('usePaySettlement', () => {
  afterEach(() => {
    mock.reset()
    vi.clearAllMocks()
  })

  it('выполняет initiate и markAsSent и возвращает paymentId', async () => {
    const paymentId = 'payment-abc'
    mock.onPost('/api/events/event-1/payments/initiate').reply(200, paymentId)
    mock.onPost(`/api/events/event-1/payments/${paymentId}/sent`).reply(200)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', toUserId: 'user-2', amount: 500 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(paymentId)
  })

  it('отправляет корректные данные в теле запроса initiate', async () => {
    const paymentId = 'payment-xyz'
    let capturedBody: unknown

    mock.onPost('/api/events/event-1/payments/initiate').reply((config) => {
      capturedBody = JSON.parse(config.data)
      return [200, paymentId]
    })
    mock.onPost(`/api/events/event-1/payments/${paymentId}/sent`).reply(200)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', toUserId: 'user-3', amount: 750 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({ toUserId: 'user-3', amount: 750 })
  })

  it('возвращает isError если initiate завершился ошибкой', async () => {
    mock.onPost('/api/events/event-1/payments/initiate').reply(500)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', toUserId: 'user-2', amount: 100 })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('возвращает isError если markAsSent завершился ошибкой', async () => {
    const paymentId = 'payment-fail'
    mock.onPost('/api/events/event-1/payments/initiate').reply(200, paymentId)
    mock.onPost(`/api/events/event-1/payments/${paymentId}/sent`).reply(503)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', toUserId: 'user-2', amount: 200 })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
