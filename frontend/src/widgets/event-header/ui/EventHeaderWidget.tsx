import { useState } from 'react'
import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { eventStatusMap, formatDateRange } from '@/entities/event'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { useCompleteEvent } from '@/entities/event/api/hooks/useCompleteEvent'
import { useUserStore } from '@/entities/user'
import { CreateEventModal } from '@/features/CreateEventModal'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount'
import { UserAvatar } from '@/shared/ui/userAvatar/UserAvatar'
import { UserAvatarSizes } from '@/shared/ui/userAvatar/constants'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import EditIcon from '@/shared/assets/icons/edit.svg?react'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import ExitIcon from '@/shared/assets/icons/exit.svg?react'
import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { Text } from '@/shared/ui/text/Text'

type EventHeaderWidgetProps = {
  onLeaveEventClick: () => void
}

export const EventHeaderWidget = ({ onLeaveEventClick }: EventHeaderWidgetProps) => {
  const { eventId } = useParams<{ eventId: string }>()
  const { data: event } = useGetEvent(eventId)
  const { data: participants = [] } = useGetEventParticipants(eventId)
  const currentUserId = useUserStore((state) => state.user?.id)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { mutate: completeEvent, isPending: isCompleting } = useCompleteEvent(eventId ?? '')

  if (!event) return null

  const visibleParticipants = participants.slice(0, 5)
  const status = eventStatusMap[event.status]
  const isOwner = !!currentUserId && currentUserId === event.ownerId
  const isCompleted = event.isCompleted

  const handleComplete = () => {
    completeEvent(undefined, {
      onSuccess: () => toast.success('Событие завершено'),
      onError: () => toast.error('Не удалось завершить событие'),
    })
  }

  return (
    <section className="rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] lg:p-[20px]">
      <div className="relative flex flex-col gap-[10px] lg:flex-row lg:items-start lg:justify-between lg:gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[20px] lg:flex-row">
          <div
            className={clsx(
              'flex h-[200px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] lg:w-[200px]',
              event.imageUrl ? '' : 'bg-primary',
            )}
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon width={82.5} height={82.5} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[10px] lg:max-w-[calc(100%-220px)]">
            <div className="min-w-0 overflow-hidden" title={event.title}>
              <Text
                as="h2"
                className="truncate font-medium text-primary text-h3-d sm:text-h2-d"
              >
                {event.title}
              </Text>
            </div>
            <div className="flex items-center gap-[8px] text-primary">
              <CalendarIcon width={32} height={32} />
              <Text variant="h2" className="font-normal text-h3-d sm:text-h2-d">
                {formatDateRange(event.startDate, event.endDate)}
              </Text>
            </div>
            <Text
              className={clsx(
                status.background,
                'w-fit rounded-[48px] px-[10px] py-[5px] text-h3-d font-normal lg:px-[28px] lg:text-h2-d',
              )}
            >
              {status.label}
            </Text>
            <div className="ml-auto mt-auto flex flex-col gap-[10px] lg:flex-row">
              {isOwner && !isCompleted && (
                <>
                  <Button
                    type="button"
                    className="h-[30px] rounded-[10px] bg-yellow px-[12px] lg:h-[40px] lg:rounded-[16px] lg:px-[30px] "
                    onClick={() => setIsEditOpen(true)}
                  >
                    <EditIcon className="h-[21px] w-[21px] lg:h-[28px] lg:w-[28px]" />
                    <Text className="font-normal text-body lg:text-h2-d">Редактировать</Text>
                  </Button>
                  <Button
                    type="button"
                    disabled={isCompleting}
                    onClick={handleComplete}
                    className="whitespace-nowrap h-[30px] rounded-[10px] bg-yellow px-[12px] lg:h-[40px] lg:rounded-[16px] lg:px-[30px] disabled:opacity-60"
                  >
                    <Text className="font-normal text-body lg:text-h2-d">
                      Завершить событие
                    </Text>
                  </Button>
                </>
              )}
              {!isOwner && (
                <Button
                  type="button"
                  variant={ButtonEnum.TertiaryLight}
                  className="flex h-[30px] gap-[10px] rounded-[10px] px-[12px] lg:h-[40px] lg:rounded-[16px] lg:px-[30px]"
                  onClick={onLeaveEventClick}
                >
                  <ExitIcon className="h-[18px] w-[18px] lg:h-[22px] lg:w-[22px] text-error" />
                  <Text className="font-normal text-body lg:text-h2-d">Покинуть событие</Text>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:absolute lg:right-0 flex flex-row items-center gap-[20px] lg:flex-col lg:items-end">
          <Text className="ml-auto text-left font-normal text-h3-d lg:text-h2-d">
            {formatParticipantsCount(event.countOfParticipants)}
          </Text>
          <div className="max-w-[180px] flex -space-x-[10px] font-medium lg:-space-x-[35px]">
            {visibleParticipants.map((participant, index) => (
              <div
                key={participant.userId}
                className="relative border-[2px] border-secondary rounded-full"
                style={{ zIndex: visibleParticipants.length - index }}
              >
                <UserAvatar
                  firstName={participant.firstName}
                  lastName={participant.lastName}
                  login={participant.login}
                  avatarUrl={participant.avatarUrl}
                  variant={UserAvatarSizes.M}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        event={event}
      />
    </section>
  )
}
