import type { UserNotificationDto } from '@/entities/notification'
import { Text } from '@/shared/ui/text/Text.tsx'

import { formatNotificationDate } from '@/widgets/notifications-bell/lib/format-notification-date.ts'
import { BellRow } from '@/widgets/notifications-bell/ui/BellRow.tsx'

type NotificationRowProps = {
  notification: UserNotificationDto
  onMarkRead: () => void
}

export const NotificationRow = ({ notification, onMarkRead }: NotificationRowProps) => (
  <BellRow isHighlighted={!notification.isRead}>
    <div className="flex items-start justify-between gap-[12px]">
      <div className="flex flex-1 flex-col gap-[2px] min-w-0">
        <Text variant="h3" className="font-medium truncate">
          {notification.title}
        </Text>
        <Text variant="body" className="text-muted">
          {notification.message}
        </Text>
        <Text variant="body" className="text-muted">
          {formatNotificationDate(notification.createdAt)}
        </Text>
      </div>
      {!notification.isRead ? (
        <button
          type="button"
          onClick={onMarkRead}
          className="text-body text-muted underline-offset-2 hover:underline"
        >
          Прочитать
        </button>
      ) : null}
    </div>
  </BellRow>
)
