import { api } from '@/shared/api/api.ts'
import { s3Api } from '@/shared/api/s3Api.ts'
import type {
  CreateExpenseDto,
  CreateExpenseRequestDto,
  EventExpensesResponseDto,
  EventExpensesResponseRawDto,
  ExpenseResponseDto,
  ExpenseResponseRawDto,
  ListInboxItemResponseDto,
  ListInboxRawDto,
} from '@/entities/expense/model/types.ts'

const toRequestBody = (payload: CreateExpenseDto) => {
  const { totalAmount, participantIds, imageKey, ...rest } = payload

  return {
    ...rest,
    total_amount: totalAmount,
    participant_ids: participantIds,
    image_key: imageKey,
  } satisfies CreateExpenseRequestDto
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

const toExpenseDto = (expense: ExpenseResponseRawDto): ExpenseResponseDto => {
  return {
    id: expense.id,
    description: expense.description,
    title: expense.title,
    totalAmount: expense.total_amount,
    payerId: expense.payer_id,
    status: expense.status,
    image_key: expense.image_key,
    imageUrl: '',
    categories: expense.categories,
    firstTenParticipants: expense.first_ten_participants,
    totalParticipantsCount: expense.total_participants_count,
    createdAt: expense.created_at,
  }
}

const toInboxItemDto = (item: {
  expense_id: string
  amount_to_pay: number
  expense_title: string
  expense_status: ListInboxItemResponseDto['expenseStatus']
}): ListInboxItemResponseDto => {
  return {
    expenseId: item.expense_id,
    amountToPay: item.amount_to_pay,
    expenseTitle: item.expense_title,
    expenseStatus: item.expense_status,
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
    const { data } = await api.get<EventExpensesResponseRawDto>(`/events/${eventId}/expenses`)
    const expenses = await Promise.all(data.expenses.map((item) => withResolvedImage(toExpenseDto(item))))
    return {
      expenses,
      eventTotalSum: data.event_total_sum,
    } satisfies EventExpensesResponseDto
  },

  approve: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/approve`)
  },

  reject: async (eventId: string, expenseId: string) => {
    await api.post<void>(`/events/${eventId}/expenses/${expenseId}/reject`)
  },

  getParticipantInbox: async () => {
    const { data } = await api.get<ListInboxRawDto>('/expenses/participant/inbox')
    return data.list_inbox.map(toInboxItemDto)
  },

  confirmAsParticipant: async (expenseId: string) => {
    await api.post<void>(`/expenses/participant/${expenseId}/confirm`)
  },

  rejectAsParticipant: async (expenseId: string) => {
    await api.post<void>(`/expenses/participant/${expenseId}/leave`)
  },
}
