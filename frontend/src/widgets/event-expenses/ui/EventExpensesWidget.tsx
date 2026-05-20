import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import AddIcon from '@/shared/assets/icons/add.svg?react'

import { Button } from '@/shared/ui/button/Button'
import { Text } from '@/shared/ui/text/Text'

import { CreateExpenseModal } from '@/features/CreateExpenseModal'
import { useGetEventExpenses, type ExpenseResponseDto } from '@/entities/expense'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent.ts'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants.ts'
import { useUserStore } from '@/entities/user'

import { useExpensesActions } from '@/widgets/event-expenses/lib/use-expenses-actions.ts'
import { ExpenseRow } from '@/widgets/event-expenses/ui/ExpenseRow.tsx'

export const EventExpensesWidget = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const currentUserId = useUserStore((state) => state.user?.id)
  const { data: event } = useGetEvent(eventId)
  const { data: expensesResponse, isLoading } = useGetEventExpenses(eventId)
  const { data: participants = [] } = useGetEventParticipants(eventId)
  const { isMutating, approve, reject, remove } = useExpensesActions({ eventId })

  const [isCreateExpenseModalOpen, setCreateExpenseModalOpen] = useState<boolean>(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseResponseDto | null>(null)

  const isOwner = !!currentUserId && !!event && currentUserId === event.ownerId
  const isCompleted = !!event?.isCompleted

  const participantsById = useMemo(() => {
    const map = new Map<string, string>()
    participants.forEach((p) => {
      const fullName =
        [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || p.login
      map.set(p.userId, fullName)
    })
    return map
  }, [participants])

  const expenses = expensesResponse?.expenses ?? []

  return (
    <section className="flex flex-col gap-[15px] sm:gap-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row items-center sm:justify-center gap-[10px]">
          <Text variant="h1" as="h1">
            Список расходов
          </Text>
          <Text className="font-normal text-muted text-h3-d sm:text-h2-d">
            {expenses.length}
          </Text>
        </div>
        {!isCompleted && (
          <Button
            type="button"
            className="w-fit h-[30px] sm:h-[47px] py-[2px] gap-[10px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[16px] sm:px-[30px]"
            onClick={() => setCreateExpenseModalOpen(true)}
          >
            <AddIcon className="h-[24px] w-[24px]" />
            <Text variant="h2" className="font-normal">
              Добавить расход
            </Text>
          </Button>
        )}
      </div>

      {isLoading && expenses.length === 0 ? (
        <Text className="text-muted">Загружаем расходы...</Text>
      ) : expenses.length === 0 ? (
        <Text className="text-muted">Пока нет расходов</Text>
      ) : (
        <div className="overflow-hidden rounded-[16px] border-[2px] border-primary bg-secondary">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              payerName={participantsById.get(expense.payerId) ?? '—'}
              isOwner={isOwner && !isCompleted}
              isPayer={!!currentUserId && expense.payerId === currentUserId}
              isMutating={isMutating}
              onApprove={() => approve(expense.id)}
              onReject={() => reject(expense.id)}
              onEdit={() => setEditingExpense(expense)}
              onDelete={() => remove(expense)}
            />
          ))}
        </div>
      )}

      <CreateExpenseModal
        isOpen={isCreateExpenseModalOpen}
        onClose={() => setCreateExpenseModalOpen(false)}
      />
      <CreateExpenseModal
        isOpen={editingExpense !== null}
        expense={editingExpense ?? undefined}
        onClose={() => setEditingExpense(null)}
      />
    </section>
  )
}
