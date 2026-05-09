import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'

import {UseGetEventsParams} from "@/entities/event/model/types.ts";

export function useGetEvents(params: UseGetEventsParams) {
  return useQuery({
    queryKey: ['events', 'list', JSON.stringify(params)],
    queryFn: () =>
      eventsApi.getAll(params),
  })
}
