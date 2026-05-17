import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { eventsApi } from '@/entities/event/api/eventsApi'
import { EventStatus } from '@/entities/event/model/types'

const mock = new MockAdapter(api)

const mockEvent = {
  id: 'e1',
  title: 'Test Event',
  description: 'Description',
  startDate: '2026-01-01',
  endDate: '2026-01-10',
  countOfParticipants: 2,
  categories: [],
  status: EventStatus.Active,
  imageUrl: '',
  ownerId: 'u1',
}

describe('eventsApi', () => {
  afterEach(() => mock.reset())

  describe('getAll', () => {
    it('возвращает массив событий при успешном запросе', async () => {
      mock.onGet('/api/events/user/events').reply(200, { events: [mockEvent] })
      const result = await eventsApi.getAll({})
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })

    it('передаёт параметры запроса в запрос', async () => {
      mock.onGet('/api/events/user/events').reply(200, { events: [] })
      const result = await eventsApi.getAll({ status: EventStatus.Planned, search: 'trip' })
      expect(result).toHaveLength(0)
    })

    it('возвращает пустой массив когда events пустой', async () => {
      mock.onGet('/api/events/user/events').reply(200, { events: [] })
      const result = await eventsApi.getAll({})
      expect(result).toEqual([])
    })
  })

  describe('getById', () => {
    it('возвращает данные события', async () => {
      mock.onGet('/api/events/e1').reply(200, mockEvent)
      const result = await eventsApi.getById('e1')
      expect(result.id).toBe('e1')
      expect(result.title).toBe('Test Event')
    })

    it('выбрасывает ошибку при 404', async () => {
      mock.onGet('/api/events/missing').reply(404)
      await expect(eventsApi.getById('missing')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('возвращает данные созданного события', async () => {
      const payload = {
        title: 'New Event',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        categories: [],
      }
      mock.onPost('/api/events').reply(201, { ...mockEvent, ...payload })
      const result = await eventsApi.create(payload)
      expect(result.title).toBe('New Event')
    })

    it('выбрасывает ошибку при ошибке сервера', async () => {
      const payload = {
        title: '',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        categories: [],
      }
      mock.onPost('/api/events').reply(400)
      await expect(eventsApi.create(payload)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('возвращает данные обновлённого события', async () => {
      const payload = {
        title: 'Updated Title',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        categories: [],
      }
      mock.onPatch('/api/events/e1').reply(200, { ...mockEvent, title: 'Updated Title' })
      const result = await eventsApi.update('e1', payload)
      expect(result.title).toBe('Updated Title')
    })

    it('выбрасывает ошибку при 404 когда событие не найдено', async () => {
      const payload = {
        title: 'X',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        categories: [],
      }
      mock.onPatch('/api/events/nonexistent').reply(404)
      await expect(eventsApi.update('nonexistent', payload)).rejects.toThrow()
    })
  })

  describe('getParticipants', () => {
    it('возвращает массив участников', async () => {
      const participants = [
        { userId: 'u1', login: 'alice', firstName: 'Alice', lastName: null },
        { userId: 'u2', login: 'bob', firstName: 'Bob', lastName: 'Smith' },
      ]
      mock.onGet('/api/events/e1/participants').reply(200, { participants })
      const result = await eventsApi.getParticipants('e1')
      expect(result).toHaveLength(2)
      expect(result[0].userId).toBe('u1')
    })

    it('возвращает пустой массив когда участников нет', async () => {
      mock.onGet('/api/events/e1/participants').reply(200, { participants: [] })
      const result = await eventsApi.getParticipants('e1')
      expect(result).toEqual([])
    })

    it('выбрасывает ошибку при ошибке запроса', async () => {
      mock.onGet('/api/events/e1/participants').reply(500)
      await expect(eventsApi.getParticipants('e1')).rejects.toThrow()
    })
  })

  describe('getInviteToken', () => {
    it('возвращает token и expiresAt', async () => {
      const tokenData = { token: 'abc123', expiresAt: '2026-01-11T00:00:00Z' }
      mock.onGet('/api/events/e1/token').reply(200, tokenData)
      const result = await eventsApi.getInviteToken('e1')
      expect(result.token).toBe('abc123')
      expect(result.expiresAt).toBe('2026-01-11T00:00:00Z')
    })

    it('выбрасывает ошибку при ошибке запроса', async () => {
      mock.onGet('/api/events/e1/token').reply(403)
      await expect(eventsApi.getInviteToken('e1')).rejects.toThrow()
    })
  })
})
