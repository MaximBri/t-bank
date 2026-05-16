export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EVENT: '/events/:eventId',
  INVITE: '/invite/:eventId/:token',
  PROFILE: '/profile',
  NOT_FOUND: '*',
}

export const buildEventRoute = (eventId: string) => `/events/${eventId}`
export const buildInviteRoute = (eventId: string, token: string) => `/invite/${eventId}/${token}`
