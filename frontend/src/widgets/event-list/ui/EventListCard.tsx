import clsx from 'clsx'

import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'

import { eventStatusMap, formatDateRange, type EventListItem } from '@/entities/event'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount.ts'

import { EventPreview } from './EventPreview.tsx'
import { Text } from '@/shared/ui/text/Text'

type EventListCardProps = {
  item: EventListItem
}

export const EventListCard = ({ item }: EventListCardProps) => (
  <div
    className={clsx(
      'h-[143px] sm:h-[176px] flex flex-col rounded-md border-[2px] border-primary bg-secondary p-[10px] sm:p-[20px]',
      'hover:border-yellow',
    )}
  >
    <div className="flex items-start justify-between gap-[8px]">
      <Text as="h2" className="truncate text-h3-d sm:text-h2-d">{item.title}</Text>

      <Text
        className={clsx(
          'rounded-lg px-[13px] text-body',
          eventStatusMap[item.status].background,
        )}
      >
        {eventStatusMap[item.status].label}
      </Text>
    </div>

    <div className="mt-[6px] sm:mt-[10px] flex flex-1 items-start sm:items-center justify-between">
      <div className="flex flex-col gap-[10px] text-body text-primary">
        <div className="flex items-center gap-[10px]">
          <CalendarIcon width="24px" height="24px" className="text-primary" />
          <Text>{formatDateRange(item.startDate, item.endDate)}</Text>
        </div>
        <div className="flex items-center gap-[10px]">
          <UsersIcon width="24px" height="24px" className="text-primary" />
          <Text>{formatParticipantsCount(item.participantsCount)}</Text>
        </div>
      </div>

      {item.imageUrl && <EventPreview img={item.imageUrl} />}
    </div>
  </div>
)
