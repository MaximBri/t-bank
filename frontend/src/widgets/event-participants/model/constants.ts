import { EventParticipantStatus } from '@/widgets/event-participants/model/types.ts'

export const participantStatusClasses: Record<EventParticipantStatus, string> = {
  owner: 'bg-yellow',
  participant: 'border border-primary bg-primary',
  invited: 'border border-green bg-green-light',
}

export const participantStatusLabel: Record<EventParticipantStatus, string> = {
  [EventParticipantStatus.owner]: 'Владелец',
  [EventParticipantStatus.participant]: 'Участник',
  [EventParticipantStatus.invited]: 'Приглашён',
}
