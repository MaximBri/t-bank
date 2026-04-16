import clsx from 'clsx'

import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import UsersIcon from '@/shared/assets/icons/users.svg?react'
import { formatDateRange } from '@/widgets/event-list/lib/format-date-range.ts'
import { formatParticipantsCount } from '@/widgets/event-list/lib/format-participants-count.ts'
import { eventStatusMap } from '@/widgets/event-list/model/constants.ts'
import type { EventListItem } from '@/widgets/event-list/model/types.ts'

import { EventPreview } from './EventPreview.tsx'

type EventListCardProps = {
  item: EventListItem
}

export const EventListCard = ({ item }: EventListCardProps) => (
  <div
    className={clsx(
      'min-h-[176px] flex flex-col rounded-[16px] border-[2px] border-primary bg-secondary p-[20px]',
      'hover:border-yellow',
    )}
  >
    <div className="flex items-start justify-between gap-[8px]">
      <p className="truncate text-[24px] text-primary">{item.title}</p>

      <p
        className={clsx(
          'rounded-[24px] px-[10px] text-[16px] text-primary',
          eventStatusMap[item.status].background,
        )}
      >
        {eventStatusMap[item.status].label}
      </p>
    </div>

    <div className="mt-[10px] flex flex-1 items-center justify-between">
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
