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
  image_key: string | null
  imageUrl: string
  ownerId: string
  isCompleted: boolean
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
  avatarUrl: string | null
}

export type ParticipantsResponse = {
  participants: Participant[]
}

export type EventInviteToken = {
  token: string
  expiresAt: string
}

export type CreatorInfo = {
  firstName: string
  secondName: string
  login: string
  avatarUrl: string
}

export type EventPreview = {
  eventId: string
  title: string
  imageUrl: string | null
  participantCount: number
  startDate: string
  endDate: string
  creatorInfo: CreatorInfo
}