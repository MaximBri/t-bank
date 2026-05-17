import { EventStatus } from '@/entities/event'
import { EventFilterStatus, type EventFiltersState } from './types.ts'

export const eventFiltersStorageKey = 'event-filters'

export const filterStatusToEventStatus: Record<
  Exclude<EventFilterStatus, EventFilterStatus.All>,
  EventStatus
> = {
  [EventFilterStatus.Active]: EventStatus.Active,
  [EventFilterStatus.Planned]: EventStatus.Planned,
  [EventFilterStatus.Completed]: EventStatus.Completed,
}

export const initialEventFiltersState: EventFiltersState = {
  search: '',
  status: EventFilterStatus.All,
  startDate: '',
  endDate: '',
  minParticipants: '',
  maxParticipants: '',
}
