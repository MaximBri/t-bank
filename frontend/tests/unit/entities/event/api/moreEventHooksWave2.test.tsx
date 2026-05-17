import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetEventInviteToken } from '@/entities/event/api/hooks/useGetEventInviteToken'
import { useUpdateEvent } from '@/entities/event/api/hooks/useUpdateEvent'

let mock: MockAdapter

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('useGetEventInviteToken', () => {
  it('возвращает токен приглашения', async () => {
    mock.onGet('/api/events/ev-1/token').reply(200, { token: 'abc123' })
    const { result } = renderHook(() => useGetEventInviteToken('ev-1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ token: 'abc123' })
  })

  it('не запрашивает данные когда enabled=false', async () => {
    const { result } = renderHook(() => useGetEventInviteToken('ev-1', false), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('не запрашивает данные когда eventId не передан', async () => {
    const { result } = renderHook(() => useGetEventInviteToken(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useUpdateEvent', () => {
  it('отправляет PATCH-запрос на обновление события', async () => {
    mock.onPatch('/api/events/ev-1').reply(200, { id: 'ev-1', title: 'Новое название' })
    const { result } = renderHook(() => useUpdateEvent('ev-1'), { wrapper })
    result.current.mutate({ title: 'Новое название' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
