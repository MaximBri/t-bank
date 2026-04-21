import { EventStatus, eventStatusMap, formatDateRange } from '@/entities/event'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import EditIcon from '@/shared/assets/icons/edit.svg?react'
import { Button } from '@/shared/ui/button/Button'

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

          <div className="flex flex-1 flex-col gap-[10px] text-h3-d sm:text-h2-d">
            <p className="truncate font-medium text-primary">{eventData.title}</p>
            <div className="flex items-center gap-[8px] text-primary">
              <CalendarIcon width={32} height={32} />
              <span>{formatDateRange(eventData.startDate, eventData.endDate)}</span>
            </div>
            <p
              className={`w-fit flex items-center justify-center rounded-[24px] px-[10px] sm:px-[28px] h-[35px] sm:h-[42px] ${eventStatusMap[eventData.status].background}`}
            >
              {eventStatusMap[eventData.status].label}
            </p>
            <div className="flex w-fit flex-col self-end text-body sm:text-h2-d sm:flex-row mt-auto gap-[10px]">
              <Button
                  type="button"
                  className="flex gap-[10px] h-[30px] sm:h-[40px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[12px] sm:px-[30px]"
              >
                <EditIcon className="h-[21px] w-[21px] sm:h-[28px] sm:w-[28px]"/>
                <span>Редактировать</span>
              </Button>
              <Button
                  type="button"
                  className="h-[30px] sm:h-[40px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[12px] sm:px-[30px]"
              >
                Завершить событие
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-[20px]">
          <p className="text-primary text-h3-d sm:text-h2-d">5 участников</p>
          <div className="ml-auto flex -space-x-[10px] sm:-space-x-[35px] font-medium">
            {participants.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className={"relative flex h-[40px] w-[40px] sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full border-[2px] border-secondary bg-yellow text-small sm:text-h3-d font-medium text-primary"}
                style={{zIndex: 5 - index}}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
