import { useMutation } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event/api/eventsApi.ts'

export const useApplyByToken = () => {
  return useMutation({
    mutationFn: (token: string) => eventsApi.applyByToken(token),
  })
}
