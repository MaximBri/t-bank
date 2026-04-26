import CloseIcon from '@/shared/assets/icons/close.svg?react'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button/Button.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { renderFormField } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text.tsx'
import { getDisputeExpenseFormFields } from '../lib/getDisputeExpenseFormFields.ts'
import {
  disputeExpenseFormDefaultValues,
  disputeExpenseReasonMaxLength,
} from '../model/constants.ts'
import { disputeExpenseSchema } from '../model/schema.ts'
import type { DisputeExpenseFormValues } from '../model/types.ts'

type DisputeExpenseModalProps = {
  expenseId?: number
  isOpen: boolean
  onClose: () => void
}

export const DisputeExpenseModal = ({ expenseId, isOpen, onClose }: DisputeExpenseModalProps) => {
  const methods = useForm<DisputeExpenseFormValues>({
    resolver: zodResolver(disputeExpenseSchema),
    mode: 'onTouched',
    defaultValues: disputeExpenseFormDefaultValues,
  })

  const { reasonField } = getDisputeExpenseFormFields()
  const { handleSubmit, reset, watch } = methods
  const reasonValue = watch('reason') ?? ''

  const handleModalClose = () => {
    reset(disputeExpenseFormDefaultValues)
    onClose()
  }

  const submitForm = handleSubmit((values) => {
    console.log({
      expenseId,
      ...values,
    })
    handleModalClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      className="w-[640px] p-[40px] rounded-[24px] bg-secondary border-primary"
    >
      <div className="">
        <div className="mb-[8px] flex flex-col gap-[10px]">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="h2">
              Оспаривание расхода
            </Text>

            <button
              type="button"
              aria-label="close-dispute-expense-modal"
              onClick={handleModalClose}
            >
              <CloseIcon width={20} height={20} />
            </button>
          </div>

          <Text className="font-normal">
            Вы как владелец можете оспорить расход в случае, если он заполнен некорректно.
          </Text>
        </div>

        <FormProvider {...methods}>
          <form className="flex flex-col" onSubmit={submitForm}>
            {renderFormField(reasonField)}

            <div className="flex items-center justify-end text-[12px] font-semibold text-placeholder">
              <span>
                {reasonValue.length}/{disputeExpenseReasonMaxLength}
              </span>
            </div>

            <div className="mt-[18px] h-[40px] flex items-center gap-[10px]">
              <Button type="submit" variant={ButtonEnum.Primary} className="h-[40px] text-body">
                Оспорить
              </Button>
              <Button
                type="button"
                variant={ButtonEnum.Secondary}
                onClick={handleModalClose}
                className="h-[40px] text-body"
              >
                Отмена
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
