import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useUpdateExpense } from '@/entities/expense/api/hooks/useUpdateExpense'
import { useConfirmExpenseShare } from '@/entities/expense/api/hooks/useConfirmExpenseShare'
import { useGetParticipantInbox } from '@/entities/expense/api/hooks/useGetParticipantInbox'

let mock: MockAdapter

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('useUpdateExpense', () => {
  it('отправляет PATCH-запрос на обновление расхода', async () => {
    mock.onPatch('/api/events/ev-1/expenses/exp-1').reply(200, {})
    const { result } = renderHook(() => useUpdateExpense(), { wrapper })
    result.current.mutate({ eventId: 'ev-1', expenseId: 'exp-1', payload: { title: 'Ужин', amount: 500, category: 'Питание', participants: [] } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useConfirmExpenseShare', () => {
  it('отправляет POST-запрос на подтверждение участия', async () => {
    mock.onPost('/api/expenses/participant/exp-1/confirm').reply(200)
    const { result } = renderHook(() => useConfirmExpenseShare(), { wrapper })
    result.current.mutate({ expenseId: 'exp-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useGetParticipantInbox', () => {
  it('возвращает список входящих расходов', async () => {
    const items = [{ id: 'exp-1', title: 'Обед', amount: 300 }]
    mock.onGet('/api/expenses/participant/inbox').reply(200, items)
    const { result } = renderHook(() => useGetParticipantInbox(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(items)
  })

  it('не запрашивает данные когда enabled=false', async () => {
    const { result } = renderHook(() => useGetParticipantInbox(false), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
