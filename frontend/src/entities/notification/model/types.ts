export type UserNotificationDto = {
  id: string
  eventId: string | null
  expenseId: string | null
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export type NotificationListResponseDto = {
  items: UserNotificationDto[]
  unreadCount: number
}
