import type { EventStatusId } from '../model/types.ts'

export const eventFilterStatusOptions = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активно' },
  { id: 'planned', label: 'Запланировано' },
  { id: 'completed', label: 'Завершено' },
] as const satisfies ReadonlyArray<{ id: EventStatusId; label: string }>
