import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'

export const useGetEventInviteToken = (eventId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['event', 'invite-token', eventId],
    queryFn: () => eventsApi.getInviteToken(eventId!),
    enabled: !!eventId && enabled,
  })
}
