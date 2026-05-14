import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'

export const useGetEventParticipants = (eventId?: string) => {
  return useQuery({
    queryKey: ['event', 'participants', eventId],
    queryFn: () => eventsApi.getParticipants(eventId!),
    enabled: !!eventId,
  })
}
