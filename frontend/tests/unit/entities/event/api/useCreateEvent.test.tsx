import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useCreateEvent } from '@/entities/event/api/hooks/useCreateEvent'

const mock = new MockAdapter(api)

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const payload = {
  title: 'Новое событие',
  startDate: '2026-07-01',
  endDate: '2026-07-10',
  categories: [],
}

describe('useCreateEvent', () => {
  afterEach(() => {
    mock.reset()
  })

  it('мутация отправляет POST /events и возвращает данные', async () => {
    const serverEvent = { id: 'new-event', ...payload }
    mock.onPost('/api/events').reply(201, serverEvent)

    const { result } = renderHook(() => useCreateEvent(), { wrapper })

    act(() => { result.current.mutate(payload) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // eventsApi.create прогоняет ответ через withResolvedImage:
    // без image_key маппер добавляет imageUrl: ''
    expect(result.current.data).toEqual({ ...serverEvent, imageUrl: '' })
  })

  it('isError=true при ошибке сервера', async () => {
    mock.onPost('/api/events').reply(400, { message: 'Bad request' })

    const { result } = renderHook(() => useCreateEvent(), { wrapper })

    act(() => { result.current.mutate(payload) })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
