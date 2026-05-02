import { EventStatus, eventStatusMap } from '@/entities/event'

import { EventFilterStatus } from '../model/types.ts'

export const eventFilterStatusOptions = [
  { id: EventFilterStatus.All, label: 'Все' },
  { id: EventFilterStatus.Active, label: eventStatusMap[EventStatus.Active].label },
  { id: EventFilterStatus.Planned, label: eventStatusMap[EventStatus.Planned].label },
  { id: EventFilterStatus.Completed, label: eventStatusMap[EventStatus.Completed].label },
] as const satisfies ReadonlyArray<{ id: EventFilterStatus; label: string }>
