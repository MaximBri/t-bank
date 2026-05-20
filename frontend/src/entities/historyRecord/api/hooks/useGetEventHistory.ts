import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/entities/historyRecord/api/historyApi.ts'

export const useGetEventHistory = (eventId?: string) => {
  return useQuery({
    queryKey: ['event', 'history', eventId],
    queryFn: () => historyApi.getEventHistory(eventId!),
    enabled: !!eventId,
  })
}
