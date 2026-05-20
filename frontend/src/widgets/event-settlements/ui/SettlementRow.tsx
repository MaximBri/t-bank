import ArrowBoldIcon from '@/shared/assets/icons/arrow-bold.svg?react'

import { Button } from '@/shared/ui/button/Button.tsx'
import { Text } from '@/shared/ui/text/Text.tsx'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar.tsx'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants.ts'
import { formatPrice } from '@/shared/lib/number/format-price.ts'

import type { SettlementStepDto } from '@/entities/settlement'

import type { ParticipantLookupEntry } from '@/widgets/event-settlements/model/types.ts'

type SettlementRowProps = {
  step: SettlementStepDto
  fromUser: ParticipantLookupEntry
  toUser: ParticipantLookupEntry
  isMyDebt: boolean
  isMyCredit: boolean
  isMutating: boolean
  onPay: () => void
  onConfirm: () => void
}

export const SettlementRow = ({
  step,
  fromUser,
  toUser,
  isMyDebt,
  isMyCredit,
  isMutating,
  onPay,
  onConfirm,
}: SettlementRowProps) => {
  const isActive = step.status === 'ACTIVE'
  const isSent = step.status === 'SENT'
  const isCompleted = step.status === 'COMPLETED'
  return (
    <div className="flex flex-col rounded-lg border-[2px] border-primary bg-primary p-[10px] sm:flex-row sm:px-[20px] sm:py-[10px]">
      <div className="flex flex-1 items-center gap-[20px]">
        <UserAvatar
          firstName={fromUser.firstName}
          lastName={fromUser.lastName}
          login={fromUser.login ?? fromUser.fullName}
          avatarUrl={fromUser.avatarUrl}
          variant={UserAvatarSizes.L}
        />
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
        <UserAvatar
          firstName={toUser.firstName}
          lastName={toUser.lastName}
          login={toUser.login ?? toUser.fullName}
          avatarUrl={toUser.avatarUrl}
          variant={UserAvatarSizes.L}
        />
      </div>
      <div className="flex flex-1 flex-col-reverse items-center justify-end gap-[10px] sm:flex-row sm:gap-[20px]">
        {isMyDebt && isActive && (
          <Button type="button" disabled={isMutating} onClick={onPay}>
            <Text variant="h2" className="font-normal">
              {isMutating ? 'Отправляем...' : 'Оплатить'}
            </Text>
          </Button>
        )}
        {isMyDebt && isSent && (
          <Text variant="h3" className="font-normal text-muted">
            Ожидает подтверждения
          </Text>
        )}
        {isMyCredit && isSent && (
          <Button type="button" disabled={isMutating} onClick={onConfirm}>
            <Text variant="h2" className="font-normal">
              {isMutating ? 'Подтверждаем...' : 'Подтвердить получение'}
            </Text>
          </Button>
        )}
        {isCompleted && (
          <Text variant="h3" className="font-normal text-muted">
            Оплачено
          </Text>
        )}
        <Text className="text-h2 sm:text-h1-d">{formatPrice(step.amount)}</Text>
      </div>
    </div>
  )
}
