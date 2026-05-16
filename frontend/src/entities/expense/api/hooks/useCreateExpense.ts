import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'
import type { CreateExpenseDto } from '@/entities/expense/model/types.ts'

type CreateExpenseVariables = {
  eventId: string
  payload: CreateExpenseDto
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, payload }: CreateExpenseVariables) =>
      expensesApi.create(eventId, payload),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
    },
  })
}
