import { Button } from '@/shared/ui/button/Button.tsx'
import { skeletonItems } from '@/widgets/event-list/model/constants.ts'
import type { EventListItem } from '@/widgets/event-list/model/types.ts'

import { EventCardSkeleton } from './EventCardSkeleton.tsx'
import { EventListCard } from './EventListCard.tsx'

export type EventListWidgetProps = {
  isLoading?: boolean
  items: EventListItem[]
  onCreateEvent?: () => void
}

export const EventListWidget = ({
  items,
  isLoading = false,
  onCreateEvent,
}: EventListWidgetProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-[10px] [grid-template-columns:repeat(auto-fit,minmax(341px,1fr))] sm:gap-[20px] sm:[grid-template-columns:repeat(auto-fit,minmax(450px,1fr))]">
        {skeletonItems.map((item) => (
          <EventCardSkeleton key={item} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-[20px] sm:h-full sm:min-h-0">
        <p className="text-[28px] sm:text-h1-d">У вас пока нет событий</p>
        <Button
          className="rounded-md border-[3px] border-yellow bg-yellow px-[38px] py-[9px] text-h3-d sm:text-h2-d"
          onClick={onCreateEvent}
        >
          Создать
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-[10px] [grid-template-columns:repeat(auto-fit,minmax(341px,1fr))] sm:gap-[20px] sm:[grid-template-columns:repeat(auto-fit,minmax(450px,1fr))]">
      {items.map((item) => (
        <EventListCard key={item.id} item={item} />
      ))}
    </div>
  )
}
