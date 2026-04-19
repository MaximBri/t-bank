import clsx from 'clsx'

import { eventStatusMap, formatDateRange, type EventListItem } from '@/entities/event'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'
import { formatParticipantsCount } from '@/shared/lib/format-participants-count.ts'

import { EventPreview } from './EventPreview.tsx'

type EventListCardProps = {
  item: EventListItem
}

export const EventListCard = ({ item }: EventListCardProps) => (
  <div
    className={clsx(
      'h-[143px] sm:h-[176px] flex flex-col rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] sm:p-[20px]',
      'hover:border-yellow',
    )}
  >
    <div className="flex items-start justify-between gap-[8px]">
      <p className="truncate text-h3-d sm:text-h2-d text-primary">{item.title}</p>

      <p
        className={clsx(
          'rounded-[24px] px-[13px] text-[16px] text-primary',
          eventStatusMap[item.status].background,
        )}
      >
        {eventStatusMap[item.status].label}
      </p>
    </div>

    <div className="mt-[6px] sm:mt-[10px] flex flex-1 items-start sm:items-center justify-between">
      <div className="flex flex-col gap-[10px] text-[16px] text-primary">
        <div className="flex items-center gap-[10px]">
          <CalendarIcon width="24px" height="24px" className="text-primary" />
          <span>{formatDateRange(item.startDate, item.endDate)}</span>
        </div>
        <div className="flex items-center gap-[10px]">
          <UsersIcon width="24px" height="24px" className="text-primary" />
          <span>{formatParticipantsCount(item.participantsCount)}</span>
        </div>
      </div>

      {item.imageUrl && <EventPreview img={item.imageUrl} />}
    </div>
  </div>
)
