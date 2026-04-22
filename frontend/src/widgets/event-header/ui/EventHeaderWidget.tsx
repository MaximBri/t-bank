import { EventStatus, eventStatusMap, formatDateRange } from '@/entities/event'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import EditIcon from '@/shared/assets/icons/edit.svg?react'
import { Button } from '@/shared/ui/button/Button'
import { Text } from '@/shared/ui/text/Text'
import clsx from "clsx";

const participants = ['Г.М.', 'М.С.', 'М.В.', 'М.В.', 'Л.И.']

const eventData = {
  title: 'Поездка в Сочи',
  startDate: '2026-06-15',
  endDate: '2026-06-20',
  status: EventStatus.Active,
}

export const EventHeaderWidget = () => {
  return (
    <section className="rounded-[16px] border-[2px] border-primary bg-secondary p-[10px] sm:p-[20px]">
      <div className="flex flex-col gap-[10px] sm:gap-[12px] sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-[20px]">
          <div className="flex w-full h-[200px] sm:w-[200px] items-center justify-center rounded-[12px] bg-primary">
            <ImageIcon width={82.5} height={82.5} />
          </div>

          <div className="flex flex-1 flex-col gap-[10px]">
            <Text variant="h2" as="h2" className="truncate font-medium text-primary">{eventData.title}</Text>
            <div className="flex items-center gap-[8px] text-primary">
              <CalendarIcon width={32} height={32} />
              <Text variant="h2" className="font-normal">{formatDateRange(eventData.startDate, eventData.endDate)}</Text>
            </div>
            <Text
              className={clsx(
                  eventStatusMap[eventData.status].background,
                  'w-fit font-normal text-h3-d sm:text-h2-d rounded-[48px] px-[10px] sm:px-[28px] py-[5px]'
              )}
            >
              {eventStatusMap[eventData.status].label}
            </Text>
            <div className="flex w-fit flex-col self-end sm:flex-row mt-auto gap-[10px]">
              <Button
                  type="button"
                  className="flex gap-[10px] h-[30px] sm:h-[40px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[12px] sm:px-[30px]"
              >
                <EditIcon className="h-[21px] w-[21px] sm:h-[28px] sm:w-[28px]"/>
                <Text className="font-normal text-body sm:text-h2-d">Редактировать</Text>
              </Button>
              <Button
                  type="button"
                  className="h-[30px] sm:h-[40px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[12px] sm:px-[30px]"
              >
                <Text className="font-normal text-body sm:text-h2-d">Завершить событие</Text>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-[20px]">
          <Text className="font-normal text-h3-d sm:text-h2-d">5 участников</Text>
          <div className="ml-auto flex -space-x-[10px] sm:-space-x-[35px] font-medium">
            {participants.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className={"relative flex h-[40px] w-[40px] sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full border-[2px] border-secondary bg-yellow text-small sm:text-h3-d font-medium text-primary"}
                style={{zIndex: 5 - index}}
              >
                <Text className="font-normal text-small sm:text-h3-d">{name}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
