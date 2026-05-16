import { api } from '@/shared/api/api.ts'
import {
  InvitationDecisionDto,
  MyInvitation,
  OwnerInvitation,
} from '@/entities/invitation/model/types.ts'

export const invitationsApi = {
  getOutbox: async () => {
    const { data } = await api.get<MyInvitation[]>('/invitations/outbox')
    return data
  },

  getInbox: async () => {
    const { data } = await api.get<OwnerInvitation[]>('/invitations/inbox')
    return data
  },

  decide: async (invitationId: string, payload: InvitationDecisionDto) => {
    await api.patch<void>(`/invitations/${invitationId}/decide`, payload)
  },
}
