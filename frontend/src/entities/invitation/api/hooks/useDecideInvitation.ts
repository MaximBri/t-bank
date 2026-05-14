import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invitationsApi } from '@/entities/invitation'
import { InvitationDecisionDto } from '@/entities/invitation/model/types'

export const useDecideInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invitationId,
      payload,
    }: {
      invitationId: string
      payload: InvitationDecisionDto
    }) => invitationsApi.decide(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['event', 'participants'] })
    },
  })
}
