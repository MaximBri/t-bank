import clsx from 'clsx'

import AddEventIcon from '@/shared/assets/icons/add.svg?react'
import { Button } from '@/shared/ui/button/Button'
import { EventFiltersWidget } from '@/widgets/event-filters'
import { EventListWidget, type EventListItem } from '@/widgets/event-list'

const mockEvents: EventListItem[] = [
  {
    id: 'sochi-active-1',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: 'active',
    imageUrl: '/logo.svg',
  },
  {
    id: 'sochi-active-2',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: 'active',
  },
  {
    id: 'restaurant-planned-1',
    title: 'Сходка в ресторане',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    participantsCount: 5,
    status: 'planned',
  },
  {
    id: 'long-planned',
    title: 'Очень длинное назв...',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    participantsCount: 1,
    status: 'planned',
  },
  {
    id: 'sochi-completed',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: 'completed',
  },
  {
    id: 'restaurant-planned-2',
    title: 'Сходка в ресторане',
    startDate: '2026-05-15',
    participantsCount: 5,
    status: 'planned',
  },
]

export const HomePage = () => {
  const events = mockEvents
  const isLoading = false

  return (
    <main className="px-[30px] py-[20px]">
      <section className="mx-auto flex w-full flex-col gap-[22px]">
        <div className="flex flex-row items-center justify-between gap-4">
          <p className="m-0 text-h1 text-primary md:text-h1-d">Мои события</p>
          <Button className="flex h-[47px] w-[216px] flex-row gap-[10px] rounded-[16px] bg-yellow font-inter text-[16px] text-primary">
            <AddEventIcon width="24px" height="24px" />
            <span>Создать событие</span>
          </Button>
        </div>

        <div
          className={clsx(
            'grid gap-[25px] grid-cols-[445px_minmax(0,1fr)]',
            events.length === 0 ? 'items-center' : 'items-start',
          )}
        >
          <EventFiltersWidget />
          <EventListWidget items={events} isLoading={isLoading} />
        </div>
      </section>
    </main>
  )
}
