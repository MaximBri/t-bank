import { useParams } from 'react-router-dom'

import ArrowGrowthIcon from '@/shared/assets/icons/arrow-growth.svg?react'

import { useGetEventSettlements } from '@/entities/settlement'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent.ts'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants.ts'
import { useUserStore } from '@/entities/user'
import { Text } from '@/shared/ui/text/Text.tsx'

import { buildParticipantLookup } from '@/widgets/event-settlements/lib/build-participant-lookup.ts'
import { useSettlementsActions } from '@/widgets/event-settlements/lib/use-settlements-actions.ts'
import { SettlementRow } from '@/widgets/event-settlements/ui/SettlementRow.tsx'

export const EventSettlementsWidget = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const currentUserId = useUserStore((state) => state.user?.id)
  const { data: event } = useGetEvent(eventId)
  const isCompleted = !!event?.isCompleted
  const { data: settlements = [], isLoading } = useGetEventSettlements(eventId, isCompleted)
  const { data: participants = [] } = useGetEventParticipants(eventId)
  const { pay, confirm, isMutating } = useSettlementsActions({ eventId })
  const participantLookup = buildParticipantLookup(participants)

  const resolveUser = (userId: string, nameFromServer: string) => {
    const fromLookup = participantLookup.get(userId)
    if (fromLookup) return fromLookup
    const initials = nameFromServer
      .split(' ')
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
    return { fullName: nameFromServer, initials, avatarUrl: null }
  }

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
        {!isCompleted ? (
          <Text className="text-muted">
            Взаиморасчёты станут доступны после завершения события.
          </Text>
        ) : isLoading && settlements.length === 0 ? (
          <Text className="text-muted">Загружаем расчёты...</Text>
        ) : settlements.length === 0 ? (
          <Text className="text-muted">
            Никто никому не должен — расходы либо ещё не подтверждены, либо уже закрыты.
          </Text>
        ) : (
          <div className="flex flex-col gap-[15px]">
            {settlements.map((step, index) => (
              <SettlementRow
                key={`${step.debtorId}->${step.creditorId}-${index}`}
                step={step}
                fromUser={resolveUser(step.debtorId, step.debtorName)}
                toUser={resolveUser(step.creditorId, step.creditorName)}
                isMyDebt={!!currentUserId && step.debtorId === currentUserId}
                isMyCredit={!!currentUserId && step.creditorId === currentUserId}
                isMutating={isMutating}
                onPay={() => pay({ paymentId: step.paymentId })}
                onConfirm={() => confirm({ paymentId: step.paymentId })}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
