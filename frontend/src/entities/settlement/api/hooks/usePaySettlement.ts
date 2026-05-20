import { useMutation, useQueryClient } from '@tanstack/react-query'

import { paymentsApi } from '@/entities/settlement/api/paymentsApi.ts'

type PaySettlementVariables = {
  eventId: string
  paymentId: string
}

export const usePaySettlement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, paymentId }: PaySettlementVariables) => {
      await paymentsApi.markAsSent(eventId, paymentId)
    },
    onSuccess: (_paymentId, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
