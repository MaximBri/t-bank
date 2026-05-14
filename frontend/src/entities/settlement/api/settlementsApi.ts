import { api } from '@/shared/api/api.ts'
import type { SettlementStepDto } from '@/entities/settlement/model/types.ts'

export const settlementsApi = {
  getAll: async (eventId: string) => {
    const { data } = await api.get<SettlementStepDto[]>(
      `/events/${eventId}/settlements`,
    )
    return data
  },
}
