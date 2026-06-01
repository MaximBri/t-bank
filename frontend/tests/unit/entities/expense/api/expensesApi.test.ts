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
  total_amount: 3000,
  payer_id: 'u1',
  status: ExpenseResponseStatus.Pending,
  categories: ['food'],
  image_key: null,
  first_ten_participants: ['u1', 'u2'],
  total_participants_count: 2,
  created_at: '2026-01-05T12:00:00Z',
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
    it('возвращает id созданного расхода', async () => {
      mock.onPost('/api/events/ev1/expenses').reply(201, 'exp-1')
      const result = await expensesApi.create('ev1', createPayload)
      expect(result).toBe('exp-1')
    })

    it('выбрасывает ошибку при ошибке валидации', async () => {
      mock.onPost('/api/events/ev1/expenses').reply(400)
      await expect(expensesApi.create('ev1', createPayload)).rejects.toThrow()
    })
  })

  describe('getAll', () => {
    it('возвращает список расходов и общую сумму', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(200, {
        expenses: [mockExpense],
        event_total_sum: 3000,
      })
      const result = await expensesApi.getAll('ev1')
      expect(result.expenses).toHaveLength(1)
      expect(result.expenses[0].id).toBe('exp-1')
      expect(result.eventTotalSum).toBe(3000)
    })

    it('возвращает пустой список расходов', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(200, { expenses: [], event_total_sum: 0 })
      const result = await expensesApi.getAll('ev1')
      expect(result.expenses).toEqual([])
      expect(result.eventTotalSum).toBe(0)
    })

    it('выбрасывает ошибку при ошибке сервера', async () => {
      mock.onGet('/api/events/ev1/expenses').reply(500)
      await expect(expensesApi.getAll('ev1')).rejects.toThrow()
    })
  })

  describe('approve', () => {
    it('успешно выполняется без ошибок', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/approve').reply(200)
      await expect(expensesApi.approve('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('выбрасывает ошибку при 403', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/approve').reply(403)
      await expect(expensesApi.approve('ev1', 'exp-1')).rejects.toThrow()
    })
  })

  describe('reject', () => {
    it('успешно выполняется без ошибок', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/reject').reply(200)
      await expect(expensesApi.reject('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('выбрасывает ошибку при 403', async () => {
      mock.onPost('/api/events/ev1/expenses/exp-1/reject').reply(403)
      await expect(expensesApi.reject('ev1', 'exp-1')).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('успешно выполняется без ошибок', async () => {
      mock.onDelete('/api/events/ev1/expenses/exp-1').reply(204)
      await expect(expensesApi.remove('ev1', 'exp-1')).resolves.toBeUndefined()
    })

    it('выбрасывает ошибку при 404 когда расход не найден', async () => {
      mock.onDelete('/api/events/ev1/expenses/missing').reply(404)
      await expect(expensesApi.remove('ev1', 'missing')).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('успешно выполняется без ошибок', async () => {
      mock.onPatch('/api/events/ev1/expenses/exp-1').reply(200)
      await expect(expensesApi.update('ev1', 'exp-1', createPayload)).resolves.toBeUndefined()
    })

    it('выбрасывает ошибку при 400', async () => {
      mock.onPatch('/api/events/ev1/expenses/exp-1').reply(400)
      await expect(expensesApi.update('ev1', 'exp-1', createPayload)).rejects.toThrow()
    })
  })

  describe('getParticipantInbox', () => {
    it('возвращает данные входящих расходов', async () => {
      const inbox = {
        list_inbox: [
          {
            expense_id: 'exp-1',
            expense_title: 'Dinner',
            amount_to_pay: 1500,
            expense_status: 'pending',
          },
        ],
      }
      mock.onGet('/api/expenses/participant/inbox').reply(200, inbox)
      const result = await expensesApi.getParticipantInbox()
      expect(result).toHaveLength(1)
      expect(result[0].expenseId).toBe('exp-1')
    })

    it('выбрасывает ошибку при ошибке сервера', async () => {
      mock.onGet('/api/expenses/participant/inbox').reply(500)
      await expect(expensesApi.getParticipantInbox()).rejects.toThrow()
    })
  })

  describe('confirmAsParticipant', () => {
    it('успешно выполняется без ошибок', async () => {
      mock.onPost('/api/expenses/participant/exp-1/confirm').reply(200)
      await expect(expensesApi.confirmAsParticipant('exp-1')).resolves.toBeUndefined()
    })

    it('выбрасывает ошибку при ошибке запроса', async () => {
      mock.onPost('/api/expenses/participant/exp-1/confirm').reply(404)
      await expect(expensesApi.confirmAsParticipant('exp-1')).rejects.toThrow()
    })
  })
})
