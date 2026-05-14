export const buildInviteLink = (eventId: string, token: string) =>
  `${window.location.origin}/invite/${eventId}/${token}`
