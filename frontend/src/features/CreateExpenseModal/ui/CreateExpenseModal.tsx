import CloseIcon from '@/shared/assets/icons/close.svg?react'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { createExpenseSchema } from '@/features/CreateExpenseModal/model/schema.ts'
import {
  CreateExpenseFormFields,
  createExpenseFormOutput,
  ExpenseCandidate,
} from '@/features/CreateExpenseModal/model/types.ts'

import { createExpenseFormDefaultValues } from '@/features/CreateExpenseModal/model/constants.ts'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text.tsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { renderFormField } from '@/shared/ui/form'
import { getCreateExpenseFormFields } from '@/features/CreateExpenseModal/lib/get-create-expense-form-fields.ts'
import { ExpenseCategory } from '@/entities/expense'
import { ParticipantsField } from '@/features/CreateExpenseModal/ui/ParticipantsField.tsx'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount.ts'

const participants: ExpenseCandidate[] = [
  {
    id: 1,
    fullName: 'Иван Петров',
  },
  {
    id: 2,
    fullName: 'Мария Сидорова',
  },
  {
    id: 3,
    fullName: 'Иван Петров',
  },
  {
    id: 4,
    fullName: 'Мария Сидорова',
  },
  {
    id: 5,
    fullName: 'Иван Петров',
  },
  {
    id: 6,
    fullName: 'Мария Сидорова',
  },
  {
    id: 7,
    fullName: 'Иван Петров',
  },
  {
    id: 8,
    fullName: 'Мария Сидорова',
  },
]

const categories: ExpenseCategory[] = ['Проживание', 'Еда', 'Транспорт', 'Развлечения']

type CreateExpenseModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreateExpenseModal = ({ isOpen, onClose }: CreateExpenseModalProps) => {
  const methods = useForm<createExpenseFormOutput>({
    resolver: zodResolver(createExpenseSchema),
    mode: 'onTouched',
    defaultValues: createExpenseFormDefaultValues,
  })

  const {
    titleField,
    categoryField,
    commentField,
    checkImageField,
    participantsField,
    amountField,
  }: CreateExpenseFormFields = getCreateExpenseFormFields({
    participants,
    categories,
  })

  const { handleSubmit, reset, watch } = methods

  const selectedParticipants = watch('participants') || []
  const amount = watch('amount') || 0

  const resetModalState = () => {
    reset(createExpenseFormDefaultValues)
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  const submitForm = handleSubmit((values) => {
    console.log(values)
    handleClose()
  })

  const perPerson =
    selectedParticipants.length > 0 ? Math.floor(amount / selectedParticipants.length) : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-[320px] rounded-lg bg-secondary sm:w-[964px]"
    >
      <div className="p-[15px] sm:px-[30px] sm:py-[24px]">
        <div className="mb-[10px] flex items-center justify-between gap-4">
          <Text as="h2" className="text-h3-d sm:text-h2-d">
            Добавление расхода
          </Text>
          <button
            aria-label="close-create-expense-modal"
            className="transition-opacity hover:opacity-70"
            onClick={handleClose}
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <FormProvider {...methods}>
          <form className="flex flex-col gap-[10px] sm:gap-[20px]" onSubmit={submitForm}>
            {renderFormField(titleField)}
            <div className="flex flex-col gap-[10px] sm:flex-row sm:gap-[23px]">
              {renderFormField(amountField)}
              {renderFormField(categoryField)}
            </div>

            <div className="mb-[5px] flex flex-col sm:flex-row sm:gap-[23px]">
              {renderFormField(commentField)}
              {renderFormField(checkImageField)}
            </div>

            <div className="flex flex-col gap-[15px]">
              <ParticipantsField key={participantsField.name} {...participantsField} />
              {selectedParticipants.length > 0 && amount > 0 ? (
                <Text className="font-medium text-[14px] sm:text-body">
                  По {perPerson.toLocaleString()} ₽ на человека (
                  {formatParticipantsCount(selectedParticipants.length)})
                </Text>
              ) : (
                <span></span>
              )}
            </div>
            <div>
              <Button type="submit" className="font-medium">
                Добавить
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
