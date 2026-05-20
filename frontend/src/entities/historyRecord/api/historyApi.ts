import { api } from '@/shared/api/api.ts'

export type HistoryRecordDto = {
  id: string
  eventId: string
  userId: string
  userFullName: string
  actionType: string
  message: string
  createdAt: string
}

export const historyApi = {
  getEventHistory: async (eventId: string) => {
    const { data } = await api.get<HistoryRecordDto[]>(`/events/${eventId}/history`)
    return data
  },
}
