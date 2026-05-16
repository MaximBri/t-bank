import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'

export const useGetEvent = (id?: string) => {
  return useQuery({
    queryKey: ['event', 'detail', id],
    queryFn: async () => {
      return eventsApi.getById(id!)
    },
    enabled: !!id,
  })
}
