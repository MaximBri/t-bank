import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '@/entities/expense/api/expensesApi.ts'

export const useGetEventExpenses = (eventId?: string) => {
  return useQuery({
    queryKey: ['event', 'expenses', eventId],
    queryFn: () => expensesApi.getAll(eventId!),
    enabled: !!eventId,
  })
}
