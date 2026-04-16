import SearchIcon from '@/shared/assets/icons/search.svg?react'
import clsx from 'clsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { DateInput, NumberInput, TextInput } from '@/shared/ui/inputs'
import { useEventFiltersStore } from '../model/useEventFiltersStore.ts'
import { eventFilterStatusOptions } from './event-filters.constants.ts'

export const EventFiltersWidget = () => {
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
    <div className="rounded-[24px] border border-primary bg-secondary p-[20px]">
      <div className="flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[20px]">
          <h1 className="text-h2 font-medium text-primary">Фильтры и поиск</h1>

          <TextInput
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-[44px] w-full rounded-[16px] border border-primary pl-[50px] pr-[16px] text-[16px] text-primary placeholder:text-placeholder focus:border-primary"
            placeholder="Поиск по событиям"
            icon={<SearchIcon className="text-placeholder" />}
            iconPosition="left"
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="m-0 text-[20px] text-inter text-primary">Статус</p>
          <div className="flex flex-wrap gap-[10px]">
            {eventFilterStatusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={clsx(
                  'rounded-[16px] px-[16px] py-[8px] text-body text-primary',
                  option.id === status ? 'bg-yellow' : 'bg-primary',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[15px]">
          <label className="flex flex-col gap-[10px]">
            <span className="text-[20px] text-primary">Дата от</span>
            <DateInput
              name="start-date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder="дд.мм.гггг"
              className="border border-primary bg-secondary px-[16px] py-[10px] text-body text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </label>
          <label className="flex flex-col gap-[10px]">
            <span className="text-[20px] text-primary">Дата до</span>
            <DateInput
              name="end-date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              placeholder="дд.мм.гггг"
              className="border border-primary bg-secondary px-[16px] py-[10px] text-body text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </label>
        </div>

        <div className="flex flex-col gap-[10px]">
          <span className="text-[20px] text-primary">Количество участников</span>
          <div className="grid w-full grid-cols-2 gap-[15px]">
            <NumberInput
              name="min-count"
              value={minParticipants}
              onChange={(event) => setMinParticipants(event.target.value)}
              placeholder="от 0"
              className="border border-primary bg-secondary px-[16px] py-[10px] text-[20px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
            <NumberInput
              name="max-count"
              value={maxParticipants}
              onChange={(event) => setMaxParticipants(event.target.value)}
              placeholder="до 100"
              className="border border-primary bg-secondary px-[16px] py-[10px] text-[20px] text-primary outline-none transition-colors placeholder:text-placeholder focus:border-[#8f8f8f]"
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={reset}
        className="mt-[20px] rounded-[16px] border-[2px] border-primary bg-primary px-[40px] py-[10px] text-[16px] font-medium text-primary"
      >
        Сбросить
      </Button>
    </div>
  )
}
