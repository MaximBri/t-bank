import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useApproveExpense } from '@/entities/expense/api/hooks/useApproveExpense'
import { useGetParticipantInbox } from '@/entities/expense/api/hooks/useGetParticipantInbox'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useApproveExpense', () => {
  afterEach(() => {
    mock.reset()
  })

  it('отправляет POST /events/:eventId/expenses/:expenseId/approve', async () => {
    mock.onPost('/api/events/event-1/expenses/expense-1/approve').reply(200)

    const { result } = renderHook(() => useApproveExpense(), { wrapper })

    act(() => {
      result.current.mutate({ eventId: 'event-1', expenseId: 'expense-1' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('isError=true при ошибке сервера', async () => {
    mock.onPost('/api/events/event-1/expenses/expense-1/approve').reply(403)

    const { result } = renderHook(() => useApproveExpense(), { wrapper })

    act(() => {
      result.current.mutate({ eventId: 'event-1', expenseId: 'expense-1' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useGetParticipantInbox', () => {
  afterEach(() => {
    mock.reset()
  })

  const mockInbox = {
    list_inbox: [
      {
        expense_id: 'expense-1',
        expense_title: 'Ужин',
        amount_to_pay: 500,
        expense_status: 'pending',
      },
    ],
  }

  it('возвращает входящие расходы участника', async () => {
    mock.onGet('/api/expenses/participant/inbox').reply(200, mockInbox)

    const { result } = renderHook(() => useGetParticipantInbox(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].expenseId).toBe('expense-1')
  })

  it('не выполняет запрос когда enabled=false', () => {
    const { result } = renderHook(() => useGetParticipantInbox(false), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('возвращает isError при ошибке сервера', async () => {
    mock.onGet('/api/expenses/participant/inbox').reply(401)

    const { result } = renderHook(() => useGetParticipantInbox(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
