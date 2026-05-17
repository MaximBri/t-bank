import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetEventSettlements } from '@/entities/settlement/api/hooks/useGetEventSettlements'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockSettlements = [
  { fromUserId: 'user-1', toUserId: 'user-2', amount: 300 },
  { fromUserId: 'user-3', toUserId: 'user-1', amount: 150 },
]

describe('useGetEventSettlements', () => {
  afterEach(() => {
    mock.reset()
  })

  it('возвращает список взаиморасчётов при успешном запросе', async () => {
    mock.onGet('/api/events/event-1/settlements').reply(200, mockSettlements)

    const { result } = renderHook(() => useGetEventSettlements('event-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].fromUserId).toBe('user-1')
    expect(result.current.data?.[0].toUserId).toBe('user-2')
    expect(result.current.data?.[0].amount).toBe(300)
  })

  it('не выполняет запрос когда eventId не передан', () => {
    const { result } = renderHook(() => useGetEventSettlements(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('не выполняет запрос когда eventId пустая строка', () => {
    const { result } = renderHook(() => useGetEventSettlements(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('возвращает пустой массив когда взаиморасчётов нет', async () => {
    mock.onGet('/api/events/event-2/settlements').reply(200, [])

    const { result } = renderHook(() => useGetEventSettlements('event-2'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })

  it('возвращает isError при ошибке сервера', async () => {
    mock.onGet('/api/events/event-err/settlements').reply(500)

    const { result } = renderHook(() => useGetEventSettlements('event-err'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
