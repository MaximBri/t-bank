import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { EventStatus } from '@/entities/event/model/types'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockEvent = {
  id: 'event-1',
  title: 'Тест событие',
  description: 'Описание',
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  countOfParticipants: 3,
  categories: [],
  status: EventStatus.Active,
  imageUrl: '',
  ownerId: 'user-1',
}

describe('useGetEvent', () => {
  afterEach(() => {
    mock.reset()
  })

  it('возвращает данные события при успешном запросе', async () => {
    mock.onGet('/api/events/event-1').reply(200, mockEvent)

    const { result } = renderHook(() => useGetEvent('event-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('event-1')
    expect(result.current.data?.title).toBe('Тест событие')
  })

  it('не выполняет запрос когда id не передан (enabled=false)', () => {
    const { result } = renderHook(() => useGetEvent(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('возвращает isError при ошибке 404', async () => {
    mock.onGet('/api/events/nonexistent').reply(404)

    const { result } = renderHook(() => useGetEvent('nonexistent'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 2500 })
  })
})
