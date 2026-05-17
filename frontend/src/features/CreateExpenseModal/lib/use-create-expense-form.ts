import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { s3Api } from '@/shared/api/s3Api.ts'
import { useCreateExpense, useUpdateExpense, type ExpenseResponseDto } from '@/entities/expense'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent.ts'
import { useGetEventParticipants } from '@/entities/event/api/hooks/useGetEventParticipants.ts'
import { useUserStore } from '@/entities/user'

import { createExpenseFormDefaultValues } from '@/features/CreateExpenseModal/model/constants.ts'
import { createExpenseSchema } from '@/features/CreateExpenseModal/model/schema.ts'
import type {
  createExpenseFormOutput,
  ExpenseCandidate,
} from '@/features/CreateExpenseModal/model/types.ts'

type UseCreateExpenseFormParams = {
  isOpen: boolean
  expense?: ExpenseResponseDto
  onSuccess: () => void
}

export const useCreateExpenseForm = ({
  isOpen,
  expense,
  onSuccess,
}: UseCreateExpenseFormParams) => {
  const { eventId } = useParams<{ eventId: string }>()
  const currentUserId = useUserStore((state) => state.user?.id)
  const { data: eventParticipants } = useGetEventParticipants(eventId)
  const { data: event } = useGetEvent(eventId)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const isEdit = !!expense
  const categories = event?.categories ?? []

  const participants = useMemo<ExpenseCandidate[]>(() => {
    if (!eventParticipants) return []
    return eventParticipants.map((p) => {
      const baseName = [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || p.login
      const isSelf = p.userId === currentUserId
      return {
        id: p.userId,
        fullName: isSelf ? `${baseName} (Вы)` : baseName,
        isLocked: isSelf,
      }
    })
  }, [eventParticipants, currentUserId])

  const methods = useForm<createExpenseFormOutput>({
    resolver: zodResolver(createExpenseSchema),
    mode: 'onTouched',
    defaultValues: createExpenseFormDefaultValues,
  })

  const { handleSubmit, reset, setValue, getValues } = methods

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  const submitForm = handleSubmit(async (values) => {
    if (!eventId) return

    let imageKey: string | undefined
    if (values.checkImage) {
      try {
        imageKey = await s3Api.uploadFile(values.checkImage)
      } catch {
        toast.error('Не удалось загрузить чек')
        return
      }
    }

    const participantIds = values.participants.filter((id) => id !== currentUserId)
    const payload = {
      title: values.title,
      description: values.comment || undefined,
      totalAmount: values.amount,
      imageKey,
      categories: values.category ? [values.category] : [],
      participantIds,
    }

    try {
      if (isEdit && expense) {
        await updateExpense.mutateAsync({
          eventId,
          expenseId: expense.id,
          payload,
        })
        toast.success('Расход обновлён')
      } else {
        await createExpense.mutateAsync({ eventId, payload })
        toast.success('Расход добавлен')
      }
      onSuccess()
    } catch {
      toast.error(
        isEdit ? 'Не удалось обновить расход' : 'Не удалось добавить расход',
      )
    }
  })

  const resetForm = () => reset(createExpenseFormDefaultValues)

  useEffect(() => {
    if (!isOpen) return
    if (expense) {
      reset({
        title: expense.title,
        amount: expense.totalAmount,
        category: expense.categories[0] ?? '',
        participants: expense.firstTenParticipants,
        comment: expense.description,
      })
    } else {
      reset(createExpenseFormDefaultValues)
    }
  }, [isOpen, expense, reset])

  useEffect(() => {
    if (!isOpen || !currentUserId) return
    const current = getValues('participants') || []
    if (!current.includes(currentUserId)) {
      setValue('participants', [...current, currentUserId], { shouldValidate: true })
    }
  }, [isOpen, currentUserId, getValues, setValue])

  return {
    methods,
    participants,
    categories,
    isEdit,
    isSubmitting,
    submitForm,
    resetForm,
  }
}
