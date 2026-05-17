import { api } from '@/shared/api/api.ts'
import {
  CreateEventDto,
  EventInviteToken,
  EventResponse,
  GetEventsParams,
  ParticipantsResponse,
  UpdateEventDto,
  UserEventDto,
} from '@/entities/event/model/types.ts'

export const eventsApi = {
  getAll: async (params: GetEventsParams) => {
    const { status, ...rest } = params
    const { data } = await api.get<UserEventDto>('/events/user/events', {
      params: { ...rest, state: status },
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

  getParticipants: async (id: string) => {
    const { data } = await api.get<ParticipantsResponse>(`/events/${id}/participants`)
    return data.participants
  },

  getInviteToken: async (id: string) => {
    const { data } = await api.get<EventInviteToken>(`/events/${id}/token`)
    return data
  },
}