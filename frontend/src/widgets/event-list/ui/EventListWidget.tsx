import { Button } from '@/shared/ui/button/Button.tsx'
import { skeletonItems } from '@/widgets/event-list/model/constants.ts'
import type { EventListItem } from '@/widgets/event-list/model/types.ts'

import { EventCardSkeleton } from './EventCardSkeleton.tsx'
import { EventListCard } from './EventListCard.tsx'

export type EventListWidgetProps = {
  isLoading?: boolean
  items: EventListItem[]
}

export const EventListWidget = ({ items, isLoading = false }: EventListWidgetProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-[20px] [grid-template-columns:repeat(auto-fit,minmax(450px,1fr))]">
        {skeletonItems.map((item) => (
          <EventCardSkeleton key={item} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[20px]">
        <p className="text-[32px]">У вас пока нет событий</p>
        <Button className="rounded-[16px] border-[3px] border-yellow bg-yellow px-[38px] py-[9px] text-[24px]">
          Создать
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-[20px] [grid-template-columns:repeat(auto-fit,minmax(450px,1fr))]">
      {items.map((item) => (
        <EventListCard key={item.id} item={item} />
      ))}
    </div>
  )
}
