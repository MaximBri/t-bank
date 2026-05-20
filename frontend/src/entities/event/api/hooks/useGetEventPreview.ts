import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event/api/eventsApi.ts'

export const useGetEventPreview = (token?: string) => {
  return useQuery({
    queryKey: ['event', 'preview', token],
    queryFn: () => eventsApi.getPreview(token!),
    enabled: !!token,
  })
}
