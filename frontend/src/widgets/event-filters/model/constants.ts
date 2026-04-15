import type { EventFiltersState, EventStatusId } from './types.ts'

export const eventFiltersStorageKey = 'event-filters'

export const eventStatusIds = [
  'all',
  'active',
  'planned',
  'completed',
] as const satisfies ReadonlyArray<EventStatusId>

export const initialEventFiltersState: EventFiltersState = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
  minParticipants: '',
  maxParticipants: '',
}
