import SearchIcon from '@/shared/assets/icons/search.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import clsx from 'clsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { DateInput, NumberInput, TextInput } from '@/shared/ui/inputs'
import { useEventFiltersStore } from '../model/useEventFiltersStore.ts'
import { eventFilterStatusOptions } from './constants.ts'

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
    <div className="text-h3 sm:text-h3-d rounded-md sm:rounded-lg border-[2px] sm:border border-primary bg-secondary p-[15px] sm:p-[20px]">
      <div className="flex flex-col gap-[14px] sm:gap-[20px]">
        <div className="flex flex-col gap-[14px] sm:gap-[20px]">
          <div className="flex w-full justify-between flex-row sm:block">
            <h1 className="text-h3-d sm:text-h2 font-medium text-primary">Фильтры и поиск</h1>
            <Button
              type="button"
              aria-label="close-filters-modal"
              className="text-primary sm:hidden"
              onClick={onClose}
            >
              <CloseIcon width="20px" height="20px" />
            </Button>
          </div>

          <TextInput
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="text-body h-[44px] w-full rounded-md border border-primary pl-[50px] pr-[16px] text-primary placeholder:text-placeholder focus:border-primary"
            placeholder="Поиск по событиям"
            icon={<SearchIcon width="24px" height="24px" className="text-placeholder" />}
            iconPosition="left"
          />
        </div>

        <div className="flex flex-col gap-[14px] sm:gap-[10px]">
          <p className="m-0 text-inter text-primary">Статус</p>
          <div className="flex flex-wrap gap-[10px]">
            {eventFilterStatusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={clsx(
                  'rounded-[10px] sm:rounded-md px-[8px] sm:px-[16px] py-[2px] sm:py-[8px] text-primary',
                  option.id === status ? 'bg-yellow' : 'bg-primary',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[10px] sm:gap-[15px]">
          <label className="flex flex-col gap-[10px]">
            <span className="sm:text-h3-d text-primary">Дата от</span>
            <DateInput
              name="start-date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder="дд.мм.гггг"
              className="text-body border border-primary bg-secondary px-[16px] py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </label>
          <label className="flex flex-col gap-[10px]">
            <span className="sm:text-h3-d text-primary">Дата до</span>
            <DateInput
              name="end-date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              placeholder="дд.мм.гггг"
              className="text-body border border-primary bg-secondary px-[16px] py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </label>
        </div>

        <div className="flex flex-col gap-[14px] sm:gap-[10px]">
          <span className="sm:text-h3-d text-primary">Количество участников</span>
          <div className="grid w-full grid-cols-2 gap-[10px] sm:gap-[15px]">
            <NumberInput
              name="min-count"
              min={0}
              max={100}
              value={minParticipants}
              onChange={(event) => setMinParticipants(event.target.value)}
              placeholder="от 0"
              className="text-h3-d border border-primary bg-secondary px-[16px]  py-[6px] sm:py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
            <NumberInput
              name="max-count"
              min={0}
              max={100}
              value={maxParticipants}
              onChange={(event) => setMaxParticipants(event.target.value)}
              placeholder="до 100"
              className="text-h3-d border border-primary bg-secondary px-[16px] py-[6px] sm:py-[10px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={reset}
        className="text-body mt-[14px] sm:mt-[20px] rounded-[10px] sm:rounded-md border-[2px] border-primary bg-primary px-[28px] sm:px-[40px] py-[2px] sm:py-[10px] font-medium text-primary"
      >
        Сбросить
      </Button>
    </div>
  )
}
