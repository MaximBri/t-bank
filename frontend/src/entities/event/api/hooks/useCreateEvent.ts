import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateEventDto } from '@/entities/event/api/types.ts'
import { eventsApi } from '@/entities/event'

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', 'list'] }),
  })
}
