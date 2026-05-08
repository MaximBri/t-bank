import { api } from '@/shared/api/api.ts'
import {
  CreateEventDto, GetEventsParams,
  EventResponse,
  UpdateEventDto,
  UserEventDto,
} from '@/entities/event/api/types.ts'

export const eventsApi = {
  getAll: async ({
    search,
    status,
    startDate,
    endDate,
    minParticipants,
    maxParticipants,
  }: GetEventsParams) => {
    const { data } = await api.get<UserEventDto[]>('/events/user/events', {
      params: {
        search,
        startDate,
        maxParticipants,
        minParticipants,
        endDate,
        status,
      },
    })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get<EventResponse>(`/events/${id}`)
    return data
  },

  create: async (eventData: CreateEventDto) => {
    const { data } = await api.post<EventResponse>(`/events`, eventData)
    return data
  },

  update: async (id: string, eventData: UpdateEventDto) => {
    const { data } = await api.patch<EventResponse>(`/events/${id}`, eventData)
    return data
  },
}