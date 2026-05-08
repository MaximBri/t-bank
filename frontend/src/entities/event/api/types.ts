import type { ExpenseCategoryList } from '@/entities/expense'
import { EventStatus } from '@/entities/event'

export type UserEventDto = {
  id: string
  title: string
  startDate: string
  endDate: string
  participantsCount: number
  status: EventStatus
  imageUrl: string
}

export type EventResponse = Omit<
  UserEventDto & {
    description: string
    ownerId: string
  },
  'participantsCount'
>

export type UseGetEventsParams = {
  search?: string
  status?: EventStatus
  startDate?: string
  endDate?: string
  minParticipants?: number
  maxParticipants?: number
}

export type GetEventsParams = UseGetEventsParams

export type CreateEventDto = {
  title: string
  description?: string
  startDate: string
  endDate?: string
  image?: File
  category: ExpenseCategoryList
}

export type UpdateEventDto = CreateEventDto