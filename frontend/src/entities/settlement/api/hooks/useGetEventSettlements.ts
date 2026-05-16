import { useQuery } from '@tanstack/react-query'

import { settlementsApi } from '@/entities/settlement/api/settlementsApi.ts'

export const useGetEventSettlements = (eventId?: string) => {
  return useQuery({
    queryKey: ['event', 'settlements', eventId],
    queryFn: () => settlementsApi.getAll(eventId!),
    enabled: !!eventId,
  })
}
