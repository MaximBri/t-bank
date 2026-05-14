import { useQuery } from '@tanstack/react-query'

import { notificationsApi } from '@/entities/notification/api/notificationsApi.ts'

export const useGetNotifications = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getAll(),
    enabled,
  })
}
