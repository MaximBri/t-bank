import { EventStatusIds, type EventFiltersState } from './types.ts'

export const eventFiltersStorageKey = 'event-filters'

export const initialEventFiltersState: EventFiltersState = {
  search: '',
  status: EventStatusIds.All,
  startDate: '',
  endDate: '',
  minParticipants: '',
  maxParticipants: '',
}
