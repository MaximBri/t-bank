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
    mock.onPost(`/api/events/event-1/payments/${paymentId}/sent`).reply(200)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', paymentId })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('отправляет запрос markAsSent по paymentId', async () => {
    const paymentId = 'payment-xyz'
    let wasCalled = false

    mock.onPost(`/api/events/event-1/payments/${paymentId}/sent`).reply(() => {
      wasCalled = true
      return [200]
    })

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', paymentId })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(wasCalled).toBe(true)
  })

  it('возвращает isError если markAsSent завершился ошибкой', async () => {
    mock.onPost('/api/events/event-1/payments/payment-fail/sent').reply(500)

    const { result } = renderHook(() => usePaySettlement(), { wrapper })

    await act(async () => {
      result.current.mutate({ eventId: 'event-1', paymentId: 'payment-fail' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
