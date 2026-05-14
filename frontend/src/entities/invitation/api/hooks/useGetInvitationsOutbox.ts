import { useQuery } from '@tanstack/react-query'
import { invitationsApi } from '@/entities/invitation'

export const useGetInvitationsOutbox = () => {
  return useQuery({
    queryKey: ['invitations', 'outbox'],
    queryFn: () => invitationsApi.getOutbox(),
  })
}
