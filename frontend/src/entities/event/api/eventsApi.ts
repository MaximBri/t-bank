import { api } from '@/shared/api/api.ts'
import { s3Api } from '@/shared/api/s3Api.ts'
import {
  CreateEventDto,
  EventInviteToken,
  EventResponse,
  GetEventsParams,
  ParticipantsResponse,
  UpdateEventDto,
  UserEventDto,
} from '@/entities/event/model/types.ts'

const withResolvedImage = async (event: EventResponse): Promise<EventResponse> => {
  if (!event.image_key) {
    return { ...event, imageUrl: '' }
  }

  try {
    const imageUrl = await s3Api.getDownloadUrl(event.image_key)
    return { ...event, imageUrl }
  } catch {
    return { ...event, imageUrl: '' }
  }
}

const toRequestBody = (eventData: CreateEventDto | UpdateEventDto) => {
  const { imageKey, image, ...rest } = eventData
  void image
  return { ...rest, image_key: imageKey }
}

export const eventsApi = {
  getAll: async (params: GetEventsParams) => {
    const { status, ...rest } = params
    const { data } = await api.get<UserEventDto>('/events/user/events', {
      params: { ...rest, state: status },
    })
    return Promise.all(data.events.map(withResolvedImage))
  },

  getById: async (id: string) => {
    const { data } = await api.get<EventResponse>(`/events/${id}`)
    return withResolvedImage(data)
  },

  create: async (eventData: CreateEventDto) => {
    const { data } = await api.post<EventResponse>(`/events`, toRequestBody(eventData))
    return withResolvedImage(data)
  },

  update: async (id: string, eventData: UpdateEventDto) => {
    const { data } = await api.patch<EventResponse>(`/events/${id}`, toRequestBody(eventData))
    return withResolvedImage(data)
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