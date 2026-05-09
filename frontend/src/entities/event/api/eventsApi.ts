import { api } from '@/shared/api/api.ts'
import {
  CreateEventDto,
  EventResponse,
  GetEventsParams,
  UpdateEventDto,
  UserEventDto,
} from '@/entities/event/model/types.ts'

export const eventsApi = {
  getAll: async (params: GetEventsParams) => {
    const { data } = await api.get<UserEventDto>('/events/user/events', {
      params: params,
    })
    return data.events
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