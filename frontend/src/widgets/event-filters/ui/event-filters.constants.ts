import { EventStatusIds } from '../model/types.ts'

export const eventFilterStatusOptions = [
  { id: EventStatusIds.All, label: 'Все' },
  { id: EventStatusIds.Active, label: 'Активно' },
  { id: EventStatusIds.Planned, label: 'Запланировано' },
  { id: EventStatusIds.Completed, label: 'Завершено' },
] as const satisfies ReadonlyArray<{ id: EventStatusIds; label: string }>
