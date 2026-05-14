import ArrowBoldIcon from '@/shared/assets/icons/arrow-bold.svg?react'

import { Button } from '@/shared/ui/button/Button.tsx'
import { Text } from '@/shared/ui/text/Text.tsx'
import { formatPrice } from '@/shared/lib/number/format-price.ts'

import type { SettlementStepDto } from '@/entities/settlement'

import type { ParticipantLookupEntry } from '@/widgets/event-settlements/model/types.ts'

type SettlementRowProps = {
  step: SettlementStepDto
  fromUser: ParticipantLookupEntry
  toUser: ParticipantLookupEntry
  isMyDebt: boolean
  isMutating: boolean
  onPay: () => void
}

export const SettlementRow = ({
  step,
  fromUser,
  toUser,
  isMyDebt,
  isMutating,
  onPay,
}: SettlementRowProps) => {
  return (
    <div className="flex flex-col rounded-lg border-[2px] border-primary bg-primary p-[10px] sm:flex-row sm:px-[20px] sm:py-[10px]">
      <div className="flex flex-1 items-center gap-[20px]">
        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-yellow sm:h-[80px] sm:w-[80px]">
          <Text className="text-h3-d sm:text-h2-d">{fromUser.initials}</Text>
        </div>
        <div className="max-w-[250px] min-w-0">
          <Text className="truncate text-h3-d font-medium sm:text-h2-d">
            {fromUser.fullName}
          </Text>
          <Text className="text-h3-d font-medium text-muted">должен(-на)</Text>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <ArrowBoldIcon width={44} height={44} className="rotate-180 sm:rotate-90" />
      </div>
      <div className="flex flex-1 flex-row-reverse items-center justify-end gap-[20px] text-right sm:flex-row sm:pr-[100px] sm:text-left 3xl:pr-[180px]">
        <div className="max-w-[250px] min-w-0 text-start sm:text-end">
          <Text className="truncate text-h3-d font-medium sm:text-h2-d">
            {toUser.fullName}
          </Text>
          <Text className="text-h3-d font-medium text-muted">получит</Text>
        </div>
        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-yellow sm:h-[80px] sm:w-[80px]">
          <Text className="text-h3-d sm:text-h2-d">{toUser.initials}</Text>
        </div>
      </div>
      <div className="flex flex-1 flex-col-reverse items-center justify-end gap-[10px] sm:flex-row sm:gap-[20px]">
        {isMyDebt ? (
          <Button type="button" disabled={isMutating} onClick={onPay}>
            <Text variant="h2" className="font-normal">
              {isMutating ? 'Отправляем...' : 'Оплатить'}
            </Text>
          </Button>
        ) : null}
        <Text className="text-h2 sm:text-h1-d">{formatPrice(step.amount)}</Text>
      </div>
    </div>
  )
}
