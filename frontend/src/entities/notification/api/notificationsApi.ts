import { api } from '@/shared/api/api.ts'
import type { NotificationListResponseDto } from '@/entities/notification/model/types.ts'

export const notificationsApi = {
  getAll: async () => {
    const { data } = await api.get<NotificationListResponseDto>('/notifications')
    return data
  },

  getUnreadCount: async () => {
    const { data } = await api.get<number>('/notifications/unread-count')
    return data
  },

  markAsRead: async (id: string) => {
    await api.patch<void>(`/notifications/${id}/read`)
  },
}
