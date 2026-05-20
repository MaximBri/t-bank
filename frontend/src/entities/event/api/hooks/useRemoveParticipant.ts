import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event/api/eventsApi.ts'

export const useRemoveParticipant = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => eventsApi.removeParticipant(eventId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', 'participants', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event', 'detail', eventId] })
    },
  })
}
