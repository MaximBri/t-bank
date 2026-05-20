import { useConfirmSettlement, usePaySettlement } from '@/entities/settlement'

import type {
  ConfirmSettlementVariables,
  PaySettlementVariables,
  UseSettlementsActionsParams,
} from '@/widgets/event-settlements/model/types.ts'

export const useSettlementsActions = ({ eventId }: UseSettlementsActionsParams) => {
  const paySettlement = usePaySettlement()
  const confirmSettlement = useConfirmSettlement()

  const pay = ({ paymentId }: PaySettlementVariables) => {
    if (!eventId) return
    paySettlement.mutate({ eventId, paymentId })
  }

  const confirm = ({ paymentId }: ConfirmSettlementVariables) => {
    if (!eventId) return
    confirmSettlement.mutate({ eventId, paymentId })
  }

  return {
    pay,
    confirm,
    isMutating: paySettlement.isPending || confirmSettlement.isPending,
  }
}
