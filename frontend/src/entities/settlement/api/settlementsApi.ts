import { api } from '@/shared/api/api.ts'
import type { SettlementStepDto } from '@/entities/settlement/model/types.ts'

type EventSettlementsResponse = {
  eventId: string
  totalOutstandingDebts: number
  settlements: SettlementStepDto[]
}

export const settlementsApi = {
  getAll: async (eventId: string) => {
    const { data } = await api.get<EventSettlementsResponse>(
      `/events/${eventId}/settlements`,
    )
    return data.settlements
  },
}
