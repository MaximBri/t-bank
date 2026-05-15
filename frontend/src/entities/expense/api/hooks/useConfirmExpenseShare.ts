import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

type ConfirmShareVariables = {
  expenseId: string
  eventId?: string
}

export const useConfirmExpenseShare = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId }: ConfirmShareVariables) =>
      expensesApi.confirmAsParticipant(expenseId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'participant', 'inbox'] })
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event', 'expenses', eventId] })
        queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
      }
    },
  })
}
