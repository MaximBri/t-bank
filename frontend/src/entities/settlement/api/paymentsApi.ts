import { api } from '@/shared/api/api.ts'

export const paymentsApi = {
  markAsSent: async (eventId: string, paymentId: string) => {
    await api.post<void>(`/events/${eventId}/payments/${paymentId}/sent`)
  },

  cancel: async (eventId: string, paymentId: string) => {
    await api.post<void>(`/events/${eventId}/payments/${paymentId}/fail`)
  },

  complete: async (eventId: string, paymentId: string) => {
    await api.post<void>(`/events/${eventId}/payments/${paymentId}/complete`)
  },
}
