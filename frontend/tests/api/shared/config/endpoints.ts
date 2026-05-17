export const API_ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  EVENTS_CATEGORIES_DEFAULT: '/events/categories',
  EVENTS: '/events',
  EVENTS_USER_EVENTS: '/events/user/events',
  PROFILE_ME: '/me',
  PROFILE_PASSWORD: '/me/password',
} as const

export const buildEventPath = (eventId: string) => `/events/${eventId}`
export const buildEventExpensesPath = (eventId: string) => `/events/${eventId}/expenses`
export const buildEventParticipantsPath = (eventId: string) => `/events/${eventId}/participants`
