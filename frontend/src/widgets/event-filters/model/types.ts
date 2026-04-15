export type EventStatusId = 'all' | 'active' | 'planned' | 'completed'

export type EventFiltersState = {
  search: string
  status: EventStatusId
  startDate: string
  endDate: string
  minParticipants: string
  maxParticipants: string
}

export type EventFiltersStore = EventFiltersState & {
  setSearch: (search: string) => void
  setStatus: (status: EventStatusId) => void
  setStartDate: (startDate: string) => void
  setEndDate: (endDate: string) => void
  setMinParticipants: (minParticipants: string) => void
  setMaxParticipants: (maxParticipants: string) => void
  reset: () => void
}
