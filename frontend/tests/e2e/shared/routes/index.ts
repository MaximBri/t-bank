export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EVENT: '/events/:eventId',
  INVITE: '/invite/:eventId/:token',
  PROFILE: '/profile',
  NOT_FOUND: '*',
}

export const API_ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',
  EVENTS: '/events',
} as const

export const buildEventRoute = (eventId: string) => `/events/${eventId}`
export const buildInviteRoute = (eventId: string, token: string) => `/invite/${eventId}/${token}`
