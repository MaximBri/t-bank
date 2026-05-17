import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useApproveExpense, useDeleteExpense, useRejectExpense } from '@/entities/expense'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

afterEach(() => { mock.reset() })

describe('useApproveExpense', () => {
  it('отправляет POST-запрос на подтверждение расхода', async () => {
    mock.onPost('/api/events/ev-1/expenses/exp-1/approve').reply(200)
    const { result } = renderHook(() => useApproveExpense(), { wrapper })
    result.current.mutate({ eventId: 'ev-1', expenseId: 'exp-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useRejectExpense', () => {
  it('отправляет POST-запрос на отклонение расхода', async () => {
    mock.onPost('/api/events/ev-1/expenses/exp-1/reject').reply(200)
    const { result } = renderHook(() => useRejectExpense(), { wrapper })
    result.current.mutate({ eventId: 'ev-1', expenseId: 'exp-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteExpense', () => {
  it('отправляет DELETE-запрос на удаление расхода', async () => {
    mock.onDelete('/api/events/ev-1/expenses/exp-1').reply(200)
    const { result } = renderHook(() => useDeleteExpense(), { wrapper })
    result.current.mutate({ eventId: 'ev-1', expenseId: 'exp-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
