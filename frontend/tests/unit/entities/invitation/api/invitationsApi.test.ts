import MockAdapter from 'axios-mock-adapter'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { api } from '@/shared/api/api'
import { invitationsApi } from '@/entities/invitation/api/invitationsApi'
import { InvitationStatus } from '@/entities/invitation'

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('invitationsApi', () => {
  it('getInbox возвращает входящие приглашения', async () => {
    const data = [{ id: '1', title: 'Событие', login: 'user', status: 'pending_approval', createdAt: '2026-01-01' }]
    mock.onGet('/api/invitations/inbox').reply(200, data)
    const result = await invitationsApi.getInbox()
    expect(result).toEqual(data)
  })

  it('getOutbox возвращает исходящие приглашения', async () => {
    const data = [{ id: '2', title: 'Событие 2', status: 'pending', createdAt: '2026-01-02' }]
    mock.onGet('/api/invitations/outbox').reply(200, data)
    const result = await invitationsApi.getOutbox()
    expect(result).toEqual(data)
  })

  it('decide отправляет PATCH с решением', async () => {
    mock.onPatch('/api/invitations/inv-1/decide').reply(200)
    await expect(invitationsApi.decide('inv-1', { status: InvitationStatus.Accepted })).resolves.toBeUndefined()
  })
})
