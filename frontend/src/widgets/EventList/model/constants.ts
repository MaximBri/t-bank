import type { EventStatus } from './types'

export const skeletonItems = Array.from({ length: 12 }, (_, index) => index)

export const eventStatusMap: Record<
  EventStatus,
  {
    background: string
    label: string
  }
> = {
  active: {
    background: 'bg-yellow',
    label: 'Активно',
  },
  planned: {
    background: 'bg-green',
    label: 'Запланировано',
  },
  completed: {
    background: 'bg-primary',
    label: 'Завершено',
  },
}
