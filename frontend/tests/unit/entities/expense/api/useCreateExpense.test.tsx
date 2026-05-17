import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/api/api'
import { useCreateExpense } from '@/entities/expense/api/hooks/useCreateExpense'

const mock = new MockAdapter(api)

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

const payload = {
  title: 'Такси',
  totalAmount: 500,
  categories: ['transport'],
  participantIds: ['user-1', 'user-2'],
}

describe('useCreateExpense', () => {
  afterEach(() => {
    mock.reset()
  })

  it('отправляет POST /events/:eventId/expenses и инвалидирует кеш', async () => {
    mock.onPost('/api/events/event-1/expenses').reply(201, 'expense-id-1')
    const { Wrapper, qc } = makeWrapper()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')

    const { result } = renderHook(() => useCreateExpense(), { wrapper: Wrapper })

    act(() => { result.current.mutate({ eventId: 'event-1', payload }) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe('expense-id-1')
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['event', 'expenses', 'event-1'] }),
    )
  })

  it('isError=true при ошибке 400', async () => {
    mock.onPost('/api/events/event-1/expenses').reply(400)
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useCreateExpense(), { wrapper: Wrapper })

    act(() => { result.current.mutate({ eventId: 'event-1', payload }) })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
