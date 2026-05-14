import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'
import type { CreateExpenseDto } from '@/entities/expense/model/types.ts'

type UpdateExpenseVariables = {
  eventId: string
  expenseId: string
  payload: CreateExpenseDto
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, expenseId, payload }: UpdateExpenseVariables) =>
      expensesApi.update(eventId, expenseId, payload),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
    },
  })
}
