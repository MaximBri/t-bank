import CloseIcon from '@/shared/assets/icons/close.svg?react'

import { FormProvider } from 'react-hook-form'

import { CreateExpenseFormFields } from '@/features/CreateExpenseModal/model/types.ts'

import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text.tsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { renderFormField } from '@/shared/ui/form'
import { getCreateExpenseFormFields } from '@/features/CreateExpenseModal/lib/get-create-expense-form-fields.ts'
import { useCreateExpenseForm } from '@/features/CreateExpenseModal/lib/use-create-expense-form.ts'
import { ParticipantsField } from '@/features/CreateExpenseModal/ui/ParticipantsField.tsx'
import { formatParticipantsCount } from '@/shared/lib/formatParticipantsCount.ts'
import type { ExpenseResponseDto } from '@/entities/expense'

type CreateExpenseModalProps = {
  isOpen: boolean
  onClose: () => void
  expense?: ExpenseResponseDto
}

export const CreateExpenseModal = ({ isOpen, onClose, expense }: CreateExpenseModalProps) => {
  const {
    methods,
    participants,
    categories,
    isEdit,
    isSubmitting,
    submitForm,
    resetForm,
  } = useCreateExpenseForm({
    isOpen,
    expense,
    onSuccess: () => {
      resetForm()
      onClose()
    },
  })

  const handleClose = () => {
    resetForm()
    onClose()
  }

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

  const selectedParticipants = methods.watch('participants') || []
  const amount = methods.watch('amount') || 0
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
            {isEdit ? 'Редактирование расхода' : 'Добавление расхода'}
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
              <Button type="submit" className="font-medium" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? 'Сохранение...'
                    : 'Добавление...'
                  : isEdit
                    ? 'Сохранить'
                    : 'Добавить'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
