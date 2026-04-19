import { useState } from 'react'

import { EventStatus, type EventListItem } from '@/entities/event'
import { CreateEventModal } from '@/features/create-event'
import clsx from 'clsx'

import AddEventIcon from '@/shared/assets/icons/add.svg?react'
import FilterIcon from '@/shared/assets/icons/filter.svg?react'

import { Button } from '@/shared/ui/button/Button'
import { EventFiltersWidget, MobileEventFiltersModal } from '@/widgets/event-filters'
import { EventListWidget } from '@/widgets/event-list'

const mockEvents: EventListItem[] = [
  {
    id: 'sochi-active-1',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: EventStatus.Active,
    imageUrl: '/logo.svg',
  },
  {
    id: 'sochi-active-2',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: EventStatus.Active,
  },
  {
    id: 'restaurant-planned-1',
    title: 'Сходка в ресторане',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    participantsCount: 5,
    status: EventStatus.Planned,
  },
  {
    id: 'long-planned',
    title: 'Очень длинное назв...',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    participantsCount: 1,
    status: EventStatus.Planned,
  },
  {
    id: 'sochi-completed',
    title: 'Поездка в Сочи',
    startDate: '2026-04-06',
    endDate: '2026-04-20',
    participantsCount: 5,
    status: EventStatus.Completed,
  },
  {
    id: 'restaurant-planned-2',
    title: 'Сходка в ресторане',
    startDate: '2026-05-15',
    participantsCount: 5,
    status: EventStatus.Planned,
  },
]

export const HomePage = () => {
  const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false)
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false)
  const events = mockEvents
  const isLoading = false

  return (
    <>
      <main className="px-[10px] py-[10px] sm:px-[30px] sm:py-[20px]">
        <section className="mx-auto flex w-full flex-col gap-[22px]">
          <div className="flex flex-col gap-[10px] sm:flex-row items-start sm:items-center sm:justify-between sm:gap-0">
            <p className="text-h1 text-primary sm:text-h1-d">Мои события</p>
            <div className="flex w-full sm:w-auto flex-row justify-between">
              <Button
                className="flex h-[30px] w-[200px] sm:h-[47px] sm:w-[216px] flex-row gap-[10px] rounded-[10px] sm:rounded-[16px] bg-yellow text-body text-primary"
                onClick={() => setCreateEventModalOpen(true)}
              >
                <AddEventIcon width="24px" height="24px" />
                <span>Создать событие</span>
              </Button>
              <Button
                className="flex flex-row gap-[10px] justify-between text-center rounded-[10px] h-[30px] border border-primary px-[6px] sm:hidden"
                onClick={() => setFiltersModalOpen(true)}
              >
                <FilterIcon width="16px" height="16px" />
                <span>Фильтры</span>
              </Button>
            </div>
          </div>

          <div
            className={clsx(
              'sm:grid sm:grid-cols-[445px_minmax(0,1fr)] sm:gap-[25px]',
              events.length > 0 && 'sm:items-start',
            )}
          >
            <div className="hidden sm:block">
              <EventFiltersWidget />
            </div>
            <EventListWidget
              items={events}
              isLoading={isLoading}
              onCreateEvent={() => setCreateEventModalOpen(true)}
            />
          </div>
        </section>
      </main>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
      />
      <MobileEventFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
      />
    </>
  )
}
