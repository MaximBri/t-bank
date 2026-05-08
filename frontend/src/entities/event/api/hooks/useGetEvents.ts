import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'
import { UseGetEventsParams } from '@/entities/event/api/types.ts'

export function useGetEvents({
  search = '',
  status = undefined,
  startDate = '',
  endDate = '',
  minParticipants = 0,
  maxParticipants = undefined,
}: UseGetEventsParams) {
  return useQuery({
    queryKey: ['events', 'list', search, status, startDate, endDate, minParticipants, maxParticipants],
    queryFn: () => eventsApi.getAll({
      search,
      status,
      startDate,
      endDate,
      minParticipants,
      maxParticipants,
    }),
  })
}
