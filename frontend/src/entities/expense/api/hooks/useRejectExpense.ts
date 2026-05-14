import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

type RejectVariables = {
  eventId: string
  expenseId: string
}

export const useRejectExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, expenseId }: RejectVariables) =>
      expensesApi.reject(eventId, expenseId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
    },
  })
}
