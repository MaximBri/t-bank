import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants'
import { useGetInvitationsInbox } from '@/entities/invitation/api/hooks/useGetInvitationsInbox'
import { InvitationStatus } from '@/entities/invitation'
import { useUserStore } from '@/entities/user'

import {
  EventParticipantStatus,
  ParticipantRow,
  ParticipantRowKind,
  ParticipantsFilter,
  UseEventParticipantsRowsParams,
} from '../model/types'

export const useEventParticipantsRows = ({
  eventId,
  filter,
  searchQuery,
}: UseEventParticipantsRowsParams) => {
  const currentUser = useUserStore((state) => state.user)
  const { data: participants = [] } = useGetEventParticipants(eventId)
  const { data: event } = useGetEvent(eventId)
  const { data: inbox = [] } = useGetInvitationsInbox()

  const ownerId = event?.ownerId
  const isCurrentUserOwner = !!currentUser && !!ownerId && currentUser.id === ownerId

  const pendingRequests =
    isCurrentUserOwner && event
      ? inbox.filter(
          (item) =>
            item.status === InvitationStatus.PendingApproval && item.title === event.title,
        )
      : []

  const rows: ParticipantRow[] = [
    ...participants.map<ParticipantRow>((participant) => ({
      kind: ParticipantRowKind.Participant,
      key: `participant-${participant.userId}`,
      userId: participant.userId,
      login: participant.login,
      firstName: participant.firstName,
      lastName: participant.lastName,
      avatarUrl: participant.avatarUrl,
      status:
        !!ownerId && participant.userId === ownerId
          ? EventParticipantStatus.owner
          : EventParticipantStatus.participant,
    })),
    ...pendingRequests.map<ParticipantRow>((request) => ({
      kind: ParticipantRowKind.Pending,
      key: `pending-${request.id}`,
      invitationId: request.id,
      login: request.login,
    })),
  ]

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const visibleRows = rows.filter((row) => {
    if (filter === ParticipantsFilter.Accepted && row.kind !== ParticipantRowKind.Participant) {
      return false
    }
    if (filter === ParticipantsFilter.Invited && row.kind !== ParticipantRowKind.Pending) {
      return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      row.login,
      row.kind === ParticipantRowKind.Participant ? row.firstName : null,
      row.kind === ParticipantRowKind.Participant ? row.lastName : null,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })

  return {
    participantsCount: participants.length,
    visibleRows,
  }
}
