export enum InvitationStatus {
  PendingApproval = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}

export type InvitationDecision = InvitationStatus.Accepted | InvitationStatus.Rejected

export type MyInvitation = {
  id: string
  title: string
  status: InvitationStatus
  createdAt: string
}

export type OwnerInvitation = {
  id: string
  title: string
  login: string
  status: InvitationStatus
  createdAt: string
}

export type InvitationDecisionDto = {
  status: InvitationDecision
}
