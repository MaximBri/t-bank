import type { ExpenseCategoryList } from '@/entities/expense'

export enum EventStatus {
  Active = 'active',
  Planned = 'planned',
  Completed = 'completed',
}

type Event = {
  id: string
  title: string
  status: EventStatus
}

export type EventListItem = Event & {
  imageUrl?: string
  startDate: string
  endDate?: string
  participantsCount: number
}

export type EventDetails = EventListItem & {
  description?: string
  categories?: ExpenseCategoryList
  ownerId: number
}
