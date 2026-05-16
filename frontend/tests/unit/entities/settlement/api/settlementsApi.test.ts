import MockAdapter from 'axios-mock-adapter'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { api } from '@/shared/api/api'
import { settlementsApi } from '@/entities/settlement/api/settlementsApi'

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(api) })
afterEach(() => { mock.restore() })

describe('settlementsApi', () => {
  it('getAll возвращает список взаиморасчётов', async () => {
    const data = [{ fromUserId: 'u1', toUserId: 'u2', amount: 500 }]
    mock.onGet('/api/events/ev-1/settlements').reply(200, data)
    const result = await settlementsApi.getAll('ev-1')
    expect(result).toEqual(data)
  })
})
