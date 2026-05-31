import { api } from '@/shared/api/api.ts'
import { s3Api } from '@/shared/api/s3Api.ts'
import type {
  CreateExpenseDto,
  EventExpensesResponseDto,
  ExpenseResponseDto,
  ListInboxResponseDto,
} from '@/entities/expense/model/types.ts'

const toRequestBody = (payload: CreateExpenseDto) => {
  const { imageKey, ...rest } = payload
  return { ...rest, image_key: imageKey }
}

const withResolvedImage = async (
  expense: ExpenseResponseDto,
): Promise<ExpenseResponseDto> => {
  if (!expense.image_key) {
    return { ...expense, imageUrl: '' }
  }

  try {
    const imageUrl = await s3Api.getDownloadUrl(expense.image_key)
    return { ...expense, imageUrl }
  } catch {
    return { ...expense, imageUrl: '' }
  }
}

export const expensesApi = {
  create: async (eventId: string, payload: CreateExpenseDto) => {
    const { data } = await api.post<string>(
      `/events/${eventId}/expenses`,
      toRequestBody(payload),
    )
    return data
  },

  update: async (eventId: string, expenseId: string, payload: CreateExpenseDto) => {
    await api.patch<void>(
      `/events/${eventId}/expenses/${expenseId}`,
      toRequestBody(payload),
    )
  },

  remove: async (eventId: string, expenseId: string) => {
    await api.delete<void>(`/events/${eventId}/expenses/${expenseId}`)
  },

  getAll: async (eventId: string) => {
    const { data } = await api.get<EventExpensesResponseDto>(`/events/${eventId}/expenses`)
    const expenses = await Promise.all(data.expenses.map(withResolvedImage))
    return { ...data, expenses }
  },

  approve: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/approve`)
  },

  reject: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/reject`)
  },

  getParticipantInbox: async () => {
    const { data } = await api.get<ListInboxResponseDto>('/expenses/participant/inbox')
    return data.listInbox
  },

  confirmAsParticipant: async (expenseId: string) => {
    await api.post<void>(`/expenses/participant/${expenseId}/confirm`)
  },

  rejectAsParticipant: async (expenseId: string) => {
    await api.post<void>(`/expenses/participant/${expenseId}/leave`)
  },
}
