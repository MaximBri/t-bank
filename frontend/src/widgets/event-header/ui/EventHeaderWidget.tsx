import { useState } from 'react'
import clsx from 'clsx'
import { useParams } from 'react-router-dom'

import { eventStatusMap, formatDateRange } from '@/entities/event'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { useUserStore } from '@/entities/user'
import { CreateEventModal } from '@/features/CreateEventModal'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount'
import { getUserInitials } from '@/shared/lib/getUserInitials'
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

  if (!event) return null

  const visibleParticipants = participants.slice(0, 5)
  const status = eventStatusMap[event.status]
  const isOwner = !!currentUserId && currentUserId === event.ownerId

  return (
    <section className="rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] sm:p-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-start sm:justify-between sm:gap-[12px]">
        <div className="flex flex-col gap-[20px] sm:flex-row">
          <div className="flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[12px] bg-primary sm:w-[200px]">
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

          <div className="flex flex-1 flex-col gap-[10px]">
            <Text variant="h2" as="h2" className="truncate font-medium text-primary">
              {event.title}
            </Text>
            <div className="flex items-center gap-[8px] text-primary">
              <CalendarIcon width={32} height={32} />
              <Text variant="h2" className="font-normal">
                {formatDateRange(event.startDate, event.endDate)}
              </Text>
            </div>
            <Text
              className={clsx(
                status.background,
                'w-fit rounded-[48px] px-[10px] py-[5px] text-h3-d font-normal sm:px-[28px] sm:text-h2-d',
              )}
            >
              {status.label}
            </Text>
            <div className="mt-auto flex flex-col flex-wrap gap-[10px] self-end sm:flex-row">
              {isOwner && (
                <>
                  <Button
                    type="button"
                    className="flex gap-[10px] rounded-[10px] bg-yellow px-[12px] py-[6px] sm:rounded-[16px] sm:px-[30px] sm:py-[8px]"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <EditIcon className="h-[21px] w-[21px] sm:h-[28px] sm:w-[28px]" />
                    <Text className="font-normal text-body sm:text-h2-d">Редактировать</Text>
                  </Button>
                  <Button
                    type="button"
                    className="rounded-[10px] bg-yellow px-[12px] py-[6px] sm:rounded-[16px] sm:px-[30px] sm:py-[8px]"
                  >
                    <Text className="font-normal text-body sm:text-h2-d">Завершить событие</Text>
                  </Button>
                </>
              )}
              {!isOwner && (
                <Button
                  type="button"
                  variant={ButtonEnum.TertiaryLight}
                  className="flex gap-[10px] rounded-[10px] px-[12px] py-[6px] sm:rounded-[16px] sm:px-[30px] sm:py-[8px]"
                  onClick={onLeaveEventClick}
                >
                  <ExitIcon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px] text-error" />
                  <Text className="font-normal text-body sm:text-h2-d">Покинуть событие</Text>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-[20px] sm:flex-col sm:items-end">
          <Text className="ml-auto text-right font-normal text-h3-d sm:text-h2-d">
            {formatParticipantsCount(event.countOfParticipants)}
          </Text>
          <div className="ml-auto flex -space-x-[10px] font-medium sm:-space-x-[35px]">
            {visibleParticipants.map((participant, index) => (
              <div
                key={participant.userId}
                className="relative flex h-[40px] w-[40px] items-center justify-center rounded-full border-[2px] border-secondary bg-yellow text-small font-medium text-primary sm:h-[60px] sm:w-[60px] sm:text-h3-d"
                style={{ zIndex: visibleParticipants.length - index }}
              >
                <Text className="font-normal text-small sm:text-h3-d">
                  {getUserInitials(participant.firstName, participant.lastName, participant.login)}
                </Text>
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
