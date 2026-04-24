import { useState } from 'react'

import { EventStatus, type EventListItem } from '@/entities/event'
import clsx from 'clsx'

import AddEventIcon from '@/shared/assets/icons/add.svg?react'
import FilterIcon from '@/shared/assets/icons/filter.svg?react'

import { Button } from '@/shared/ui/button/Button'
import { EventFiltersWidget, MobileEventFiltersModal } from '@/widgets/event-filters'
import { EventListWidget } from '@/widgets/event-list'
import { Text } from '@/shared/ui/text/Text'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { CreateEventModal } from '@/features/CreateEventModal'

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
      <main>
        <section className="mx-auto flex w-full flex-col gap-[22px]">
          <div className="flex flex-col gap-[10px] sm:flex-row items-start sm:items-center sm:justify-between sm:gap-0">
            <Text variant="h1" as="h1">
              Мои события
            </Text>
            <div className="flex w-full sm:w-auto flex-row justify-between flex-wrap gap-[10px]">
              <Button className="sm:max-h-[47px]" onClick={() => setCreateEventModalOpen(true)}>
                <AddEventIcon width={24} height={24} />
                Создать событие
              </Button>
              <Button
                className="sm:hidden"
                onClick={() => setFiltersModalOpen(true)}
                variant={ButtonEnum.Secondary}
              >
                <FilterIcon width={16} height={16} />
                Фильтры
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
