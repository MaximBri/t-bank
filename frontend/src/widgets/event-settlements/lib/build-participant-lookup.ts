import type { Participant } from '@/entities/event/model/types.ts'
import { getUserInitials } from '@/shared/lib/getUserInitials.ts'

import type { ParticipantLookup } from '@/widgets/event-settlements/model/types.ts'

export const buildParticipantLookup = (participants: Participant[]): ParticipantLookup => {
  const map: ParticipantLookup = new Map()
  participants.forEach((p) => {
    const fullName =
      [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || p.login
    map.set(p.userId, {
      fullName,
      initials: getUserInitials(p.firstName, p.lastName, p.login),
    })
  })
  return map
}
