import { usePaySettlement } from '@/entities/settlement'

import type {
  PaySettlementVariables,
  UseSettlementsActionsParams,
} from '@/widgets/event-settlements/model/types.ts'

export const useSettlementsActions = ({ eventId }: UseSettlementsActionsParams) => {
  const paySettlement = usePaySettlement()

  const pay = ({ toUserId, amount }: PaySettlementVariables) => {
    if (!eventId) return
    paySettlement.mutate({ eventId, toUserId, amount })
  }

  return {
    pay,
    isMutating: paySettlement.isPending,
  }
}
