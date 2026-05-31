import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

type RejectShareVariables = {
  expenseId: string
  eventId?: string
}

export const useRejectExpenseShare = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId }: RejectShareVariables) =>
      expensesApi.rejectAsParticipant(expenseId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'participant', 'inbox'] })
      queryClient.invalidateQueries({ queryKey: ['event', 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements'] })
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
        queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
      }
    },
  })
}
