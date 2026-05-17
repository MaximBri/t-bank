import { useState } from 'react'

// import { EventStatus, type EventListItem } from '@/entities/event'
import clsx from 'clsx'

import AddEventIcon from '@/shared/assets/icons/add.svg?react'
import FilterIcon from '@/shared/assets/icons/filter.svg?react'

import { Button } from '@/shared/ui/button/Button'
import { EventListWidget } from '@/widgets/event-list'
import { Text } from '@/shared/ui/text/Text'
import { ButtonEnum } from '@/shared/ui/button/constants'
import { CreateEventModal } from '@/features/CreateEventModal'
import { EventFiltersWidget, MobileEventFiltersModal } from '@/widgets/event-filters'
import { useGetEvents } from "@/entities/event/api/hooks/useGetEvents.ts";
import {useEventFiltersStore} from "@/widgets/event-filters/model/useEventFiltersStore.ts";
import {parseNumberValue} from "@/shared/lib/number/parseNumber.ts";
import {EventFilterStatus} from "@/widgets/event-filters/model/types.ts";
import {filterStatusToEventStatus} from "@/widgets/event-filters/model/constants.ts";
import {useDebouncedValue} from "@/shared/lib/debounce/useDebouncedValue.ts";

export const HomePage = () => {
  const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false)
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false)
  const { search, status, startDate, endDate, minParticipants, maxParticipants } =
    useEventFiltersStore()

  const debouncedSearch = useDebouncedValue(search, 600)
  const debouncedMinParticipants = useDebouncedValue(minParticipants, 600)
  const debouncedMaxParticipants = useDebouncedValue(maxParticipants,600)

  const { data: events, isLoading } = useGetEvents({
    search: debouncedSearch === '' ? undefined : debouncedSearch,
    status: status === EventFilterStatus.All ? undefined : filterStatusToEventStatus[status],
    startDate: startDate === '' ? undefined : startDate,
    endDate: endDate === '' ? undefined : endDate,
    minParticipants: parseNumberValue(debouncedMinParticipants),
    maxParticipants: parseNumberValue(debouncedMaxParticipants),
  })

  return (
    <>
      <main>
        <section className="mx-auto flex w-full flex-col gap-[22px]">
          <div className="flex flex-col gap-[10px] lg:flex-row items-start lg:items-center lg:justify-between lg:gap-0">
            <Text variant="h1" as="h1">
              Мои события
            </Text>
            <div className="flex w-full lg:w-auto flex-row justify-between flex-wrap gap-[10px]">
              <Button className="sm:max-h-[47px]" onClick={() => setCreateEventModalOpen(true)}>
                <AddEventIcon width={24} height={24} />
                Создать событие
              </Button>
              <Button
                className="lg:hidden"
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
              'lg:grid lg:grid-cols-[445px_minmax(0,1fr)] sm:gap-[25px]',
              (events?.length ?? 0) > 0 && 'sm:items-start',
            )}
          >
            <div className="hidden lg:block">
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
