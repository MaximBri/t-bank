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
