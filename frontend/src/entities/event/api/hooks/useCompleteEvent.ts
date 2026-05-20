import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event/api/eventsApi.ts'

export const useCompleteEvent = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => eventsApi.completeEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', 'detail', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] })
    },
  })
}
