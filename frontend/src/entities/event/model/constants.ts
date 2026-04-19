import { EventStatus } from './types'

export const eventStatusMap: Record<
  EventStatus,
  {
    background: string
    label: string
  }
> = {
  [EventStatus.Active]: {
    background: 'bg-yellow',
    label: 'Активно',
  },
  [EventStatus.Planned]: {
    background: 'bg-green',
    label: 'Запланировано',
  },
  [EventStatus.Completed]: {
    background: 'bg-primary',
    label: 'Завершено',
  },
}
