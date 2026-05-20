import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '@/entities/event/api/eventsApi.ts'
import { APP_ROUTES } from '@/shared/routes'

export const useLeaveEvent = (eventId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => eventsApi.leaveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] })
      navigate(APP_ROUTES.HOME)
    },
  })
}
