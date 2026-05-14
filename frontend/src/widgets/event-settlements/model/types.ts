export type ParticipantLookupEntry = {
  fullName: string
  initials: string
}

export type ParticipantLookup = Map<string, ParticipantLookupEntry>

export type UseSettlementsActionsParams = {
  eventId?: string
}

export type PaySettlementVariables = {
  toUserId: string
  amount: number
}
