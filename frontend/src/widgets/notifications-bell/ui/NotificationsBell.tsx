import { useState } from 'react'

import NotificationIcon from '@/shared/assets/icons/notification.svg?react'

import {
  useConfirmExpenseShare,
  useGetParticipantInbox,
  useRejectExpenseShare,
} from '@/entities/expense'
import { useGetNotifications, useMarkNotificationRead } from '@/entities/notification'
import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text.tsx'

import { NotificationRow } from '@/widgets/notifications-bell/ui/NotificationRow.tsx'
import { PendingShareRow } from '@/widgets/notifications-bell/ui/PendingShareRow.tsx'

export const NotificationsBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  const { data: notificationsData } = useGetNotifications(isAuthenticated)
  const { data: inboxData } = useGetParticipantInbox(isAuthenticated)
  const markAsRead = useMarkNotificationRead()
  const confirmShare = useConfirmExpenseShare()
  const rejectShare = useRejectExpenseShare()

  const notifications = notificationsData?.items ?? []
  const unreadCount = notificationsData?.unreadCount ?? 0
  const pendingShares = inboxData ?? []

  const badgeCount = unreadCount + pendingShares.length

  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Уведомления"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary"
      >
        <NotificationIcon className="h-6 w-6" />
        {badgeCount > 0 ? (
          <span
            aria-label={`Непрочитанных: ${badgeCount}`}
            className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-[4px] text-[10px] font-medium text-white"
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Уведомления"
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[320px] max-h-[480px] overflow-y-auto rounded-md border-[2px] border-primary bg-secondary shadow-lg sm:w-[400px]"
          >
            <div className="border-b-[2px] border-primary px-[16px] py-[12px]">
              <Text variant="h2" className="font-medium">
                Уведомления
              </Text>
            </div>

            {pendingShares.length === 0 && notifications.length === 0 ? (
              <div className="px-[16px] py-[20px]">
                <Text className="text-muted">Пока ничего нет</Text>
              </div>
            ) : (
              <div className="flex flex-col">
                {pendingShares.map((item) => (
                  <PendingShareRow
                    key={item.expenseId}
                    item={item}
                    isPending={confirmShare.isPending || rejectShare.isPending}
                    onConfirm={() =>
                      confirmShare.mutate({
                        expenseId: item.expenseId,
                      })
                    }
                    onReject={() =>
                      rejectShare.mutate({
                        expenseId: item.expenseId,
                      })
                    }
                  />
                ))}
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markAsRead.mutate(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
