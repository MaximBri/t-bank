import { api } from '@/shared/api/api.ts'
import type {
  CreateExpenseDto,
  EventExpensesResponseDto,
  ParticipantInboxResponseDto,
} from '@/entities/expense/model/types.ts'

export const expensesApi = {
  create: async (eventId: string, payload: CreateExpenseDto) => {
    const { data } = await api.post<string>(`/events/${eventId}/expenses`, payload)
    return data
  },

  update: async (eventId: string, expenseId: string, payload: CreateExpenseDto) => {
    await api.patch<void>(`/events/${eventId}/expenses/${expenseId}`, payload)
  },

  remove: async (eventId: string, expenseId: string) => {
    await api.delete<void>(`/events/${eventId}/expenses/${expenseId}`)
  },

  getAll: async (eventId: string) => {
    const { data } = await api.get<EventExpensesResponseDto>(`/events/${eventId}/expenses`)
    return data
  },

  approve: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/approve`)
  },

  reject: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/reject`)
  },

  getParticipantInbox: async () => {
    const { data } = await api.get<ParticipantInboxResponseDto>('/expenses/participant/inbox')
    return data
  },

  confirmAsParticipant: async (expenseId: string) => {
    await api.post<void>(`/expenses/participant/${expenseId}/confirm`)
  },
}
