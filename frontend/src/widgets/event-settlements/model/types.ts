export type ParticipantLookupEntry = {
  fullName: string
  initials: string
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  login?: string | null
}

export type ParticipantLookup = Map<string, ParticipantLookupEntry>

export type UseSettlementsActionsParams = {
  eventId?: string
}

export type PaySettlementVariables = {
  paymentId: string
}

export type ConfirmSettlementVariables = {
  paymentId: string
}
