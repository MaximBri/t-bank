import SearchIcon from '@/shared/assets/icons/search.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import clsx from 'clsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { DateInput, NumberInput, TextInput } from '@/shared/ui/inputs'
import { useEventFiltersStore } from '../model/useEventFiltersStore.ts'
import { eventFilterStatusOptions } from './constants.ts'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { Text } from '@/shared/ui/text/Text.tsx'

type EventFiltersWidgetProps = {
  onClose?: () => void
}

export const EventFiltersWidget = ({ onClose }: EventFiltersWidgetProps) => {
  const {
    search,
    status,
    startDate,
    endDate,
    minParticipants,
    maxParticipants,
    setSearch,
    setStatus,
    setStartDate,
    setEndDate,
    setMinParticipants,
    setMaxParticipants,
    reset,
  } = useEventFiltersStore()

  return (
    <div className="text-h3 sm:text-h3-d rounded-md sm:rounded-lg border-[2px] border-primary bg-secondary p-[15px] sm:p-[20px]">
      <div className="flex flex-col gap-[14px] sm:gap-[20px]">
        <div className="flex flex-col gap-[14px] sm:gap-[20px]">
          <div className="flex w-full justify-between flex-row sm:block">
            <Text as="h2" variant="h2" className="text-h3-d">
              Фильтры и поиск
            </Text>
            <Button
              aria-label="close-filters-modal"
              className="sm:hidden"
              variant={ButtonEnum.Empty}
              onClick={onClose}
            >
              <CloseIcon width={20} height={20} />
            </Button>
          </div>

          <TextInput
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="text-body h-[44px] w-full rounded-md border border-primary pl-[50px] pr-[16px] text-primary placeholder:text-placeholder focus:border-primary"
            placeholder="Поиск по событиям"
            icon={<SearchIcon width={24} height={24} className="text-placeholder" />}
            iconPosition="left"
          />
        </div>

        <div className="flex flex-col gap-[14px] sm:gap-[10px]">
          <Text variant="h3" as="h3">
            Статус
          </Text>
          <div className="flex flex-wrap gap-[10px]">
            {eventFilterStatusOptions.map((option) => {
              const isActive = option.id === status
              return (
                <Button
                  key={option.id}
                  onClick={() => setStatus(option.id)}
                  variant={!isActive ? ButtonEnum.Secondary : ButtonEnum.Primary}
                  className={clsx(
                    'h-[35px] rounded-[10px] border-transparent',
                  )}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[10px] sm:gap-[15px]">
          <label className="flex flex-col gap-[10px]">
            <Text variant="h3" as="h3">
              Дата от
            </Text>
            <DateInput
              name="start-date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder="дд.мм.гггг"
            />
          </label>
          <label className="flex flex-col gap-[10px]">
            <Text variant="h3" as="h3">
              Дата до
            </Text>
            <DateInput
              name="end-date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              placeholder="дд.мм.гггг"
            />
          </label>
        </div>

        <div className="flex flex-col gap-[14px] sm:gap-[10px]">
          <Text variant="h3" as="h3">
            Количество участников
          </Text>
          <div className="grid w-full grid-cols-2 gap-[10px] sm:gap-[15px]">
            <NumberInput
              name="min-count"
              value={minParticipants}
              onChange={(event) => setMinParticipants(event.target.value)}
              placeholder="от 0"
              className="border border-primary bg-secondary px-[16px]  py-[6px] sm:py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
            <NumberInput
              name="max-count"
              value={maxParticipants}
              onChange={(event) => setMaxParticipants(event.target.value)}
              placeholder="до 100"
              className="text-h3-d border border-primary bg-secondary px-[16px] py-[6px] sm:py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </div>
        </div>
      </div>

      <Button className="mt-[14px] sm:mt-5 h-10" onClick={reset} variant={ButtonEnum.Secondary}>
        Сбросить
      </Button>
    </div>
  )
}
