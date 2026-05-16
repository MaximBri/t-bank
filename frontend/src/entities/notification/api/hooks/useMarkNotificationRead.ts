import { useMutation, useQueryClient } from '@tanstack/react-query'

import { notificationsApi } from '@/entities/notification/api/notificationsApi.ts'

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
