import { useParams } from 'react-router-dom'

import ArrowGrowthIcon from '@/shared/assets/icons/arrow-growth.svg?react'

import { useGetEventSettlements } from '@/entities/settlement'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants.ts'
import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text.tsx'

import { buildParticipantLookup } from '@/widgets/event-settlements/lib/build-participant-lookup.ts'
import { useSettlementsActions } from '@/widgets/event-settlements/lib/use-settlements-actions.ts'
import { UNKNOWN_USER } from '@/widgets/event-settlements/model/constants.ts'
import { SettlementRow } from '@/widgets/event-settlements/ui/SettlementRow.tsx'

export const EventSettlementsWidget = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const currentUserId = useUserStore((state) => state.user?.id)
  const { data: settlements = [], isLoading } = useGetEventSettlements(eventId)
  const { data: participants = [] } = useGetEventParticipants(eventId)
  const { pay, isMutating } = useSettlementsActions({ eventId })
  const participantLookup = buildParticipantLookup(participants)

  return (
    <section className="flex flex-col gap-[15px] sm:gap-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <Text variant="h1" as="h1" className="font-semibold">
          Итоговые взаиморасчёты
        </Text>
      </div>
      <div className="flex flex-col gap-[20px] rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] sm:gap-[25px] sm:p-[34px]">
        <div className="flex flex-col">
          <div className="flex gap-[20px]">
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-md bg-yellow p-[8px]">
              <ArrowGrowthIcon height={48} width={48} />
            </div>
            <div className="flex flex-col">
              <Text className="text-h3-d sm:text-h2-d">Сводка взаиморасчётов</Text>
              <Text variant="h3" className="mt-auto hidden font-medium sm:block">
                Оптимизированный список переводов для закрытия всех долгов
              </Text>
            </div>
          </div>
        </div>
        {isLoading && settlements.length === 0 ? (
          <Text className="text-muted">Загружаем расчёты...</Text>
        ) : settlements.length === 0 ? (
          <Text className="text-muted">
            Никто никому не должен — расходы либо ещё не подтверждены, либо уже закрыты.
          </Text>
        ) : (
          <div className="flex flex-col gap-[15px]">
            {settlements.map((step, index) => (
              <SettlementRow
                key={`${step.fromUserId}->${step.toUserId}-${index}`}
                step={step}
                fromUser={participantLookup.get(step.fromUserId) ?? UNKNOWN_USER}
                toUser={participantLookup.get(step.toUserId) ?? UNKNOWN_USER}
                isMyDebt={!!currentUserId && step.fromUserId === currentUserId}
                isMutating={isMutating}
                onPay={() => pay({ toUserId: step.toUserId, amount: step.amount })}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
