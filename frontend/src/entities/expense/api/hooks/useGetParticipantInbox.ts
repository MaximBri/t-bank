import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

export const useGetParticipantInbox = (enabled = true) => {
  return useQuery({
    queryKey: ['expenses', 'participant', 'inbox'],
    queryFn: () => expensesApi.getParticipantInbox(),
    enabled,
  })
}
