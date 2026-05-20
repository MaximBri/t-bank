import { useMutation, useQueryClient } from '@tanstack/react-query'

import { paymentsApi } from '@/entities/settlement/api/paymentsApi.ts'

type ConfirmSettlementVariables = {
  eventId: string
  paymentId: string
}

export const useConfirmSettlement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, paymentId }: ConfirmSettlementVariables) =>
      paymentsApi.complete(eventId, paymentId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', 'settlements', eventId] })
    },
  })
}
