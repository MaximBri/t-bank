import {
  useApproveExpense,
  useDeleteExpense,
  useRejectExpense,
  type ExpenseResponseDto,
} from '@/entities/expense'

type UseExpensesActionsParams = {
  eventId?: string
}

export const useExpensesActions = ({ eventId }: UseExpensesActionsParams) => {
  const approveExpense = useApproveExpense()
  const rejectExpense = useRejectExpense()
  const deleteExpense = useDeleteExpense()

  const isMutating =
    approveExpense.isPending || rejectExpense.isPending || deleteExpense.isPending

  const approve = (expenseId: string) => {
    if (!eventId) return
    approveExpense.mutate({ eventId, expenseId })
  }

  const reject = (expenseId: string) => {
    if (!eventId) return
    rejectExpense.mutate({ eventId, expenseId })
  }

  const remove = (expense: ExpenseResponseDto) => {
    if (!eventId) return
    const title = expense.description || expense.title || 'этот расход'
    const confirmed = window.confirm(`Удалить расход «${title}»?`)
    if (!confirmed) return
    deleteExpense.mutate({ eventId, expenseId: expense.id })
  }

  return {
    isMutating,
    approve,
    reject,
    remove,
  }
}
