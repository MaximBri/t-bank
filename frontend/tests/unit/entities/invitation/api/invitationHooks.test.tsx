import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { useGetInvitationsInbox } from '@/entities/invitation/api/hooks/useGetInvitationsInbox'
import { useGetInvitationsOutbox } from '@/entities/invitation/api/hooks/useGetInvitationsOutbox'

let mock: MockAdapter

function wrapper({ children }: PropsWithChildren) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: 0, gcTime: 0 }, mutations: { retry: 0 } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('useGetInvitationsInbox', () => {
  it('возвращает входящие приглашения', async () => {
    const items = [{ id: 'inv-1', title: 'Событие', login: 'user1', status: 'pending_approval', createdAt: '2026-01-01' }]
    mock.onGet('/api/invitations/inbox').reply(200, items)
    const { result } = renderHook(() => useGetInvitationsInbox(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(items)
  })
})

describe('useGetInvitationsOutbox', () => {
  it('возвращает исходящие приглашения', async () => {
    const items = [{ id: 'inv-2', title: 'Событие 2', status: 'pending', createdAt: '2026-01-02' }]
    mock.onGet('/api/invitations/outbox').reply(200, items)
    const { result } = renderHook(() => useGetInvitationsOutbox(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(items)
  })
})
