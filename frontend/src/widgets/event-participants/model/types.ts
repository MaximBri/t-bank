export enum EventParticipantStatus {
  owner = 'owner',
  participant = 'participant',
  invited = 'invited',
}

export type EventParticipant = {
  id: number
  firstName: string
  lastName: string
  email: string
  status: EventParticipantStatus
}
