import { EventFiltersWidget } from '@/widgets/event-filters'
import { EventListWidget, type EventListItem } from '@/widgets/event-list'
import { Button } from '@/shared/ui/button/Button'
import AddEventIcon from '@/shared/assets/icons/add.svg?react'

const mockEvents: EventListItem[] = [
  {
    id: 'sochi-active-1',
    title: 'Поездка в Сочи',
    dateRange: '6 - 20 апреля 2026',
    participantsLabel: '5 участников',
    status: 'active',
  },
  {
    id: 'sochi-active-2',
    title: 'Поездка в Сочи',
    dateRange: '6 - 20 апреля 2026',
    participantsLabel: '5 участников',
    status: 'active',
    hasPreview: false,
  },
  {
    id: 'restaurant-planned-1',
    title: 'Сходка в ресторане',
    dateRange: '15 мая - 20 июня 2026',
    participantsLabel: '5 участников',
    status: 'planned',
  },
  {
    id: 'long-planned',
    title: 'Очень длинное назв...',
    dateRange: '15 - 20 июня 2026',
    participantsLabel: '1 участник',
    status: 'planned',
    isHighlighted: true,
  },
  {
    id: 'sochi-completed',
    title: 'Поездка в Сочи',
    dateRange: '6 - 20 апреля 2026',
    participantsLabel: '5 участников',
    status: 'completed',
  },
  {
    id: 'restaurant-planned-2',
    title: 'Сходка в ресторане',
    dateRange: '15 мая - 20 июня 2026',
    participantsLabel: '5 участников',
    status: 'planned',
  },
]

export const HomePage = () => {
  return (
    <main className="py-[20px] px-[30px]">
      <section className="mx-auto flex w-full flex-col gap-[22px]">
        <div className="flex gap-4 flex-row items-center justify-between">
          <p className="m-0 text-h1 text-primary md:text-h1-d">Мои события</p>
          <Button className="flex flex-row h-[47px] w-[216px] rounded-[16px] gap-[10px] bg-yellow font-inter text-primary text-[16px]">
            <AddEventIcon
                width="24px"
                height="24px"
            ></AddEventIcon>
            <span>Создать событие</span>
          </Button>
        </div>

        <div className="grid gap-[25px] grid-cols-[445px_minmax(0,1fr)] items-start">
          <EventFiltersWidget />
          <EventListWidget items={mockEvents} />
        </div>
      </section>
    </main>
  )
}
