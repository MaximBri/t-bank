export type EventStatus = 'active' | 'planned' | 'completed'

export type EventListItem = {
  id: string
  imageUrl?: string
  status: EventStatus
  startDate: string
  endDate?: string
  title: string
  participantsCount: number
}
