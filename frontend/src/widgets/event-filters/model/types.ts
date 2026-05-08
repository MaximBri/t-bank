export enum EventFilterStatus {
  All = 'all',
  Active = 'active',
  Planned = 'planned',
  Completed = 'completed',
}

export type EventFiltersState = {
  search: string
  status: EventFilterStatus
  startDate: string
  endDate: string
  minParticipants: string
  maxParticipants: string
}

export type EventFiltersStore = EventFiltersState & {
  setSearch: (search: string) => void
  setStatus: (status: EventFilterStatus) => void
  setStartDate: (startDate: string) => void
  setEndDate: (endDate: string) => void
  setMinParticipants: (minParticipants: string) => void
  setMaxParticipants: (maxParticipants: string) => void
  reset: () => void
}
