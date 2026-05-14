import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

type ApproveVariables = {
  eventId: string
  expenseId: string
}

export const useApproveExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, expenseId }: ApproveVariables) =>
      expensesApi.approve(eventId, expenseId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
    },
  })
}
