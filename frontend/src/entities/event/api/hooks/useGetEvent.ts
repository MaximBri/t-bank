import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/entities/event'
import { getErrorInfo } from '@/shared/api/helpers'

export const useGetEvent = (id?: string) => {
  return useQuery({
    queryKey: ['event', 'detail', id],
    queryFn: async () => {
      return eventsApi.getById(id!)
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      const { status } = getErrorInfo(error)
      return status !== 403 && failureCount < 1
    },
  })
}
