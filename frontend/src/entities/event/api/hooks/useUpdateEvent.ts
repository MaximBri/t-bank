import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'

import {UpdateEventDto} from "@/entities/event/model/types.ts";

export const useUpdateEvent = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEventDto) => eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] })
    },
  })
}
