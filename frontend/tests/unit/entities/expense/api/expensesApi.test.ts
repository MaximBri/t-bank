import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it } from 'vitest'
import { api } from '@/shared/api/api'
import { expensesApi } from '@/entities/expense/api/expensesApi'
import { ExpenseResponseStatus } from '@/entities/expense/model/types'

const mock = new MockAdapter(api)

const mockExpense = {
  id: 'exp-1',
  description: 'Dinner',
  title: 'Restaurant',
  totalAmount: 3000,
  payerId: 'u1',
  status: ExpenseResponseStatus.Pending,
  categories: ['food'],
  firstTenParticipants: ['u1', 'u2'],
  totalParticipantsCount: 2,
  createdAt: '2026-01-05T12:00:00Z',
}

const createPayload = {
  title: 'Restaurant',
  description: 'Dinner',
  totalAmount: 3000,
  categories: ['food'],
  participantIds: ['u1', 'u2'],
}

describe('expensesApi', () => {
  afterEach(() => mock.reset())

  describe('create', () => {
    it('returns created expense id', async () => {
      mock.onPost('/api/events/ev1/expenses').reply(201, 'exp-1')
      const result = await expensesApi.create('ev1', createPayload)
      expect(result).toBe('exp-1')
    })

    it('throws on validation error', async () => {
      mock.onPost('/api/events/ev1/expenses').reply(400)
      await expect(expensesApi.create('ev1', createPayload)).rejects.toThrow()
    })
  })

  describe('getAll', () => {
    it('returns expenses list and total sum', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(200, {
        expenses: [mockExpense],
        eventTotalSum: 3000,
      })
      const result = await expensesApi.getAll('ev1')
      expect(result.expenses).toHaveLength(1)
      expect(result.expenses[0].id).toBe('exp-1')
      expect(result.eventTotalSum).toBe(3000)
    })

    it('returns empty expenses list', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(200, { expenses: [], eventTotalSum: 0 })
      const result = await expensesApi.getAll('ev1')
      expect(result.expenses).toEqual([])
      expect(result.eventTotalSum).toBe(0)
    })

    it('throws on server error', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(500)
      await expect(expensesApi.getAll('ev1')).rejects.toThrow()
    })
  })

  describe('approve', () => {
    it('resolves without error on success', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/approve').reply(200)
      await expect(expensesApi.approve('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('throws on 403', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/approve').reply(403)
      await expect(expensesApi.approve('ev1', 'exp-1')).rejects.toThrow()
    })
  })

  describe('reject', () => {
    it('resolves without error on success', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/reject').reply(200)
      await expect(expensesApi.reject('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('throws on 403', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/reject').reply(403)
      await expect(expensesApi.reject('ev1', 'exp-1')).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('resolves without error on success', async () => {
      mock.onDelete('/api/events/ev1/expenses/exp-1').reply(204)
      await expect(expensesApi.remove('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('throws on 404 when expense not found', async () => {
      mock.onDelete('/api/events/ev1/expenses/missing').reply(404)
      await expect(expensesApi.remove('ev1', 'missing')).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('resolves without error on success', async () => {
      mock.onPatch('/api/events/ev1/expenses/exp-1').reply(200)
      await expect(expensesApi.update('ev1', 'exp-1', createPayload)).resolves.toBeUndefined()
    })

    it('throws on 400', async () => {
      mock.onPatch('/api/events/ev1/expenses/exp-1').reply(400)
      await expect(expensesApi.update('ev1', 'exp-1', createPayload)).rejects.toThrow()
    })
  })

  describe('getParticipantInbox', () => {
    it('returns inbox data', async () => {
      const inbox = {
        pendingConfirmations: [
          {
            splitId: 's1',
            expenseId: 'exp-1',
            eventId: 'ev1',
            description: 'Dinner',
            amountToPay: 1500,
            payerId: 'u1',
            reason: '',
            createdAt: '2026-01-05T12:00:00Z',
          },
        ],
        actionRequired: [],
      }
      mock.onGet('/api/expenses/participant/inbox').reply(200, inbox)
      const result = await expensesApi.getParticipantInbox()
      expect(result.pendingConfirmations).toHaveLength(1)
      expect(result.actionRequired).toHaveLength(0)
    })

    it('throws on server error', async () => {
      mock.onGet('/api/expenses/participant/inbox').reply(500)
      await expect(expensesApi.getParticipantInbox()).rejects.toThrow()
    })
  })

  describe('confirmAsParticipant', () => {
    it('resolves without error on success', async () => {
      mock.onPost('/api/expenses/participant/exp-1/confirm').reply(200)
      await expect(expensesApi.confirmAsParticipant('exp-1')).resolves.toBeUndefined()
    })

    it('throws on error', async () => {
      mock.onPost('/api/expenses/participant/exp-1/confirm').reply(404)
      await expect(expensesApi.confirmAsParticipant('exp-1')).rejects.toThrow()
    })
  })
})
