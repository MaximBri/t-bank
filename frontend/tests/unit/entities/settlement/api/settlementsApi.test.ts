import MockAdapter from 'axios-mock-adapter'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { api } from '@/shared/api/api'
import { settlementsApi } from '@/entities/settlement/api/settlementsApi'

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('settlementsApi', () => {
  it('getAll возвращает список взаиморасчётов', async () => {
    const settlements = [{
      paymentId: 'p1',
      debtorId: 'u1',
      debtorName: 'User 1',
      creditorId: 'u2',
      creditorName: 'User 2',
      amount: 500,
      status: 'ACTIVE',
      isCurrentUserRelated: true,
    }]
    mock.onGet('/api/events/ev-1/settlements').reply(200, {
      eventId: 'ev-1',
      totalOutstandingDebts: 500,
      settlements,
    })
    const result = await settlementsApi.getAll('ev-1')
    expect(result).toEqual(settlements)
  })
})
