import { api } from '@/shared/api/api.ts'

type InitiatePaymentRequest = {
  toUserId: string
  amount: number
}

export const paymentsApi = {
  initiate: async (eventId: string, payload: InitiatePaymentRequest) => {
    const { data } = await api.post<string>(
      `/events/${eventId}/payments/initiate`,
      payload,
    )
    return data
  },

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
