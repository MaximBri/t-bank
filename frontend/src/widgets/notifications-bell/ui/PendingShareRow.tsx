import CheckIcon from '@/shared/assets/icons/check.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'

import type { ListInboxItemResponseDto } from '@/entities/expense'
import { formatPrice } from '@/shared/lib/number/format-price.ts'
import { Text } from '@/shared/ui/text/Text.tsx'

import { BellRow } from '@/widgets/notifications-bell/ui/BellRow.tsx'

type PendingShareRowProps = {
  item: ListInboxItemResponseDto
  isPending: boolean
  onConfirm: () => void
  onReject: () => void
}

export const PendingShareRow = ({ item, isPending, onConfirm, onReject }: PendingShareRowProps) => (
  <BellRow isHighlighted>
    <div className="flex items-start justify-between gap-[12px]">
      <div className="flex flex-1 flex-col gap-[2px] min-w-0">
        <Text variant="h3" className="font-medium">
          Подтвердите вашу долю
        </Text>
        <Text variant="body" className="text-muted truncate">
          {item.expenseTitle}
        </Text>
        <Text variant="body" className="text-muted">
          {formatPrice(item.amountToPay)}
        </Text>
      </div>
      <div className="flex flex-col items-stretch gap-[8px]">
        <button
          type="button"
          disabled={isPending}
          onClick={onReject}
          className="flex h-[34px] items-center gap-[6px] rounded-md border border-error bg-error-light px-[10px] disabled:opacity-60"
          aria-label="Отказаться от доли"
        >
          <CloseIcon className="h-4 w-4 text-error" />
          <Text variant="body">Отказаться</Text>
        </button>
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
    </div>
  </BellRow>
)
