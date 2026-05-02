import { EventFilterStatus, type EventFiltersState } from './types.ts'

export const eventFiltersStorageKey = 'event-filters'

export const initialEventFiltersState: EventFiltersState = {
  search: '',
  status: EventFilterStatus.All,
  startDate: '',
  endDate: '',
  minParticipants: '',
  maxParticipants: '',
}
