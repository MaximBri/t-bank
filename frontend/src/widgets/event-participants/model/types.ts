export enum EventParticipantStatus {
  owner = 'owner',
  participant = 'participant',
  invited = 'invited',
  pending = 'pending',
}

export enum ParticipantsFilter {
  All = 'all',
  Accepted = 'accepted',
  Invited = 'invited',
}

export enum ParticipantRowKind {
  Participant = 'participant',
  Pending = 'pending',
}

export type ParticipantRow =
  | {
      kind: ParticipantRowKind.Participant
      key: string
      userId: string
      login: string
      firstName: string | null
      lastName: string | null
      avatarUrl: string | null
      status: EventParticipantStatus
    }
  | {
      kind: ParticipantRowKind.Pending
      key: string
      invitationId: string
      login: string
    }

export type UseEventParticipantsRowsParams = {
  eventId?: string
  filter: ParticipantsFilter
  searchQuery: string
}

export type EventParticipant = {
  id: number
  firstName: string
  lastName: string
  email: string
  status: EventParticipantStatus
}
