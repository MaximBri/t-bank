export type NotificationItemId =
  | 'event-start'
  | 'expense-added'
  | 'notification-3'
  | 'notification-4'

export type NotificationSettings = {
  onSite: boolean
  byEmail: boolean
}

export type NotificationItem = {
  id: NotificationItemId
  label: string
}

export const notificationItems: NotificationItem[] = [
  { id: 'event-start', label: 'Начало события' },
  { id: 'expense-added', label: 'Добавление расхода' },
  { id: 'notification-3', label: 'Уведомление 3' },
  { id: 'notification-4', label: 'Уведомление 4' },
]

export const notificationDefaults: Record<NotificationItemId, NotificationSettings> = {
  'event-start': { onSite: false, byEmail: true },
  'expense-added': { onSite: false, byEmail: false },
  'notification-3': { onSite: true, byEmail: true },
  'notification-4': { onSite: true, byEmail: false },
}
