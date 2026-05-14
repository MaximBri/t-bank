import type { ExpenseCategoryList } from '@/entities/expense'

export enum EventStatus {
  Active = 'ACTIVE',
  Planned = 'PLANNED',
  Completed = 'COMPLETED',
}

export type EventResponse = {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  countOfParticipants: number
  categories: ExpenseCategoryList
  status: EventStatus
  imageUrl: string
  ownerId: string
}

export type UserEventDto = {
  events: EventResponse[]
}

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
  endDate: string
  image?: File
  imageKey?: string
  categories: ExpenseCategoryList
}

export type UpdateEventDto = CreateEventDto

export type Participant = {
  userId: string
  login: string
  firstName: string | null
  lastName: string | null
}

export type ParticipantsResponse = {
  participants: Participant[]
}

export type EventInviteToken = {
  token: string
  expiresAt: string
}