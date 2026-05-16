import CheckIcon from '@/shared/assets/icons/check.svg?react'

import type { ParticipantInboxItemDto } from '@/entities/expense'
import { formatPrice } from '@/shared/lib/number/format-price.ts'
import { Text } from '@/shared/ui/text/Text.tsx'

import { formatNotificationDate } from '@/widgets/notifications-bell/lib/format-notification-date.ts'
import { BellRow } from '@/widgets/notifications-bell/ui/BellRow.tsx'

type PendingShareRowProps = {
  item: ParticipantInboxItemDto
  isPending: boolean
  onConfirm: () => void
}

export const PendingShareRow = ({ item, isPending, onConfirm }: PendingShareRowProps) => (
  <BellRow isHighlighted>
    <div className="flex items-start justify-between gap-[12px]">
      <div className="flex flex-1 flex-col gap-[2px] min-w-0">
        <Text variant="h3" className="font-medium">
          Подтвердите вашу долю
        </Text>
        <Text variant="body" className="text-muted truncate">
          {item.description}
        </Text>
        <Text variant="body" className="text-muted">
          {formatPrice(item.amountToPay)} · {formatNotificationDate(item.createdAt)}
        </Text>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={onConfirm}
        className="flex h-[34px] items-center gap-[6px] rounded-md border border-green bg-green-light px-[10px] disabled:opacity-60"
        aria-label="Подтвердить долю"
      >
        <CheckIcon className="h-4 w-4" />
        <Text variant="body">Подтвердить</Text>
      </button>
    </div>
  </BellRow>
)
