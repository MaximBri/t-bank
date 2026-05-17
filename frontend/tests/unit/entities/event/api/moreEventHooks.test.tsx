import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetEvents } from '@/entities/event/api/hooks/useGetEvents'
import { useUpdateEvent } from '@/entities/event/api/hooks/useUpdateEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { EventStatus } from '@/entities/event/model/types'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } },
  })
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

describe('useGetEvents', () => {
  afterEach(() => {
    mock.reset()
  })

  it('возвращает список событий при успешном запросе', async () => {
    mock.onGet('/api/events/user/events').reply(200, { events: [mockEvent] })

    const { result } = renderHook(() => useGetEvents({}), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('event-1')
  })

  it('передаёт параметры фильтрации в запрос', async () => {
    // eventsApi.getAll маппит фильтр status -> query-параметр state
    mock
      .onGet('/api/events/user/events', { params: { state: EventStatus.Planned } })
      .reply(200, { events: [] })

    const { result } = renderHook(() => useGetEvents({ status: EventStatus.Planned }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })

  it('возвращает isError при ошибке сервера', async () => {
    mock.onGet('/api/events/user/events').reply(500)

    const { result } = renderHook(() => useGetEvents({}), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateEvent', () => {
  afterEach(() => {
    mock.reset()
  })

  const updatePayload = {
    title: 'Обновлённое событие',
    startDate: '2026-06-01',
    endDate: '2026-06-10',
    categories: [],
  }

  it('отправляет PATCH /events/:id и возвращает обновлённые данные', async () => {
    const updated = { ...mockEvent, ...updatePayload }
    mock.onPatch('/api/events/event-1').reply(200, updated)

    const { result } = renderHook(() => useUpdateEvent('event-1'), { wrapper })

    act(() => {
      result.current.mutate(updatePayload)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.title).toBe('Обновлённое событие')
  })

  it('isError=true при ошибке сервера', async () => {
    mock.onPatch('/api/events/event-1').reply(400, { message: 'Bad request' })

    const { result } = renderHook(() => useUpdateEvent('event-1'), { wrapper })

    act(() => {
      result.current.mutate(updatePayload)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useGetEventParticipants', () => {
  afterEach(() => {
    mock.reset()
  })

  const mockParticipants = [
    { userId: 'u-1', login: 'alice', firstName: 'Alice', lastName: 'Smith' },
    { userId: 'u-2', login: 'bob', firstName: 'Bob', lastName: null },
  ]

  it('возвращает участников события', async () => {
    mock
      .onGet('/api/events/event-1/participants')
      .reply(200, { participants: mockParticipants })

    const { result } = renderHook(() => useGetEventParticipants('event-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].login).toBe('alice')
  })

  it('не выполняет запрос когда eventId не передан (enabled=false)', () => {
    const { result } = renderHook(() => useGetEventParticipants(undefined), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('возвращает isError при ошибке 404', async () => {
    mock.onGet('/api/events/nonexistent/participants').reply(404)

    const { result } = renderHook(() => useGetEventParticipants('nonexistent'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
