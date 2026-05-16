import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'
import {CreateEventDto} from "@/entities/event/model/types.ts";

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', 'list'] }),
  })
}
