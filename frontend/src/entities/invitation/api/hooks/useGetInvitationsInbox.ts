import { useQuery } from '@tanstack/react-query'
import { invitationsApi } from '@/entities/invitation'

export const useGetInvitationsInbox = () => {
  return useQuery({
    queryKey: ['invitations', 'inbox'],
    queryFn: () => invitationsApi.getInbox(),
  })
}
