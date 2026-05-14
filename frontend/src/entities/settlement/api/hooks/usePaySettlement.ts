import { useMutation, useQueryClient } from '@tanstack/react-query'

import { paymentsApi } from '@/entities/settlement/api/paymentsApi.ts'

type PaySettlementVariables = {
  eventId: string
  toUserId: string
  amount: number
}

export const usePaySettlement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, toUserId, amount }: PaySettlementVariables) => {
      const paymentId = await paymentsApi.initiate(eventId, { toUserId, amount })
      await paymentsApi.markAsSent(eventId, paymentId)
      return paymentId
    },
    onSuccess: (_paymentId, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
