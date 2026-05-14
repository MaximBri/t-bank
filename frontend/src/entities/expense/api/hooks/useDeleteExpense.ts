import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

type DeleteExpenseVariables = {
  eventId: string
  expenseId: string
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, expenseId }: DeleteExpenseVariables) =>
      expensesApi.remove(eventId, expenseId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
    },
  })
}
