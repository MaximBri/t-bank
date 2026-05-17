import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetEventExpenses } from '@/entities/expense/api/hooks/useGetEventExpenses'
import { ExpenseResponseStatus } from '@/entities/expense/model/types'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockExpense = {
  id: 'exp-1',
  title: 'Ужин',
  description: 'Ресторан',
  totalAmount: 3000,
  payerId: 'user-1',
  status: ExpenseResponseStatus.Pending,
  categories: ['food'],
  firstTenParticipants: ['user-1', 'user-2'],
  totalParticipantsCount: 2,
  createdAt: '2026-06-01T12:00:00Z',
}

describe('useGetEventExpenses', () => {
  afterEach(() => {
    mock.reset()
  })

  it('возвращает список расходов', async () => {
    mock.onGet('/api/events/event-1/expenses').reply(200, {
      expenses: [mockExpense],
      eventTotalSum: 3000,
    })

    const { result } = renderHook(() => useGetEventExpenses('event-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.expenses).toHaveLength(1)
    expect(result.current.data?.expenses[0].title).toBe('Ужин')
    expect(result.current.data?.eventTotalSum).toBe(3000)
  })

  it('не выполняет запрос без eventId', () => {
    const { result } = renderHook(() => useGetEventExpenses(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('возвращает пустой массив расходов', async () => {
    mock.onGet('/api/events/event-2/expenses').reply(200, { expenses: [], eventTotalSum: 0 })

    const { result } = renderHook(() => useGetEventExpenses('event-2'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.expenses).toHaveLength(0)
  })
})
