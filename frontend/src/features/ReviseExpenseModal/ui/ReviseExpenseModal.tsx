import { useEffect, useState } from 'react'

import CloseIcon from '@/shared/assets/icons/close.svg?react'
import WarningIcon from '@/shared/assets/icons/warning.svg?react'
import { ExpenseListItem } from '@/entities/expense/model/types.ts'
import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text.tsx'
import { ReviseExpenseForm } from '@/features/ReviseExpenseModal/ui/ReviseExpenseForm.tsx'
import { fetchCheckImage } from '@/entities/expense/lib/fetchCheckImage.ts'

type ReviseExpenseModalProps = {
  isOpen: boolean
  onClose: () => void
  expense: ExpenseListItem
}

export const ReviseExpenseModal = ({ expense, onClose, isOpen }: ReviseExpenseModalProps) => {
  const [checkImage, setCheckImage] = useState<File | undefined>()

  const loadDefaultValues = async (getIsCancelled: () => boolean) => {
    try {
      const checkImage = await fetchCheckImage(expense.checkKey)

      if (getIsCancelled()) {
        return
      }

      if (!checkImage) {
        setCheckImage(undefined)
        return
      }

      if (!getIsCancelled()) {
        setCheckImage(checkImage)
      }
    } catch (error) {
      if (!getIsCancelled()) {
        setCheckImage(undefined)
      }
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setCheckImage(undefined)
      return
    }

    let isCancelled = false

    void loadDefaultValues(() => isCancelled)

    return () => {
      isCancelled = true
    }
  }, [isOpen, expense])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[760px] rounded-lg bg-secondary p-[15px] sm:p-[40px]"
    >
      {isOpen && checkImage ? (
        <div className="flex flex-col gap-[10px]">
          <div className="flex justify-between gap-[10px]">
            <Text as="h2" className="font-medium text-h3-d sm:text-h2-d">
              Исправление расхода
            </Text>
            <button type="button" onClick={onClose} aria-label="close-invite-modal">
              <CloseIcon className="h-[20px] w-[20px] sm:h-[20px] sm:w-[20px]" />
            </button>
          </div>

          <div className="flex flex-col gap-[10px]">
            <Text className="text-small font-normal text-placeholder sm:mb-[14px] sm:text-body">
              Владелец оспорил этот расход и отправил его на доработку. Проверьте данные, исправьте
              расход и отправьте его на повторную проверку
            </Text>
            <div className="flex gap-[10px] rounded-lg border border-error bg-error-light p-[10px] sm:p-[20px]">
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-md border-[2px] border-error bg-secondary">
                <WarningIcon height={22} width={22} />
              </div>
              <div className="flex flex-col gap-[10px]">
                <Text variant="h3" as="h3">
                  Причина оспаривания
                </Text>
                <Text className="text-sm sm:text-body">{expense?.disputeInfo?.reason}</Text>
                <div className="w-fit rounded-[12px] border border-primary bg-secondary px-[14px] text-center">
                  <Text className="text-[12px]">{expense?.disputeInfo?.timestamp}</Text>
                </div>
              </div>
            </div>
            <ReviseExpenseForm
              defaultValues={{
                checkImage,
                comment: '',
                amount: expense.amount,
                category: expense.category,
              }}
              onClose={onClose}
            />
          </div>
        </div>
      ) : (
        <Text className="py-[24px] text-body text-placeholder">Загрузка формы...</Text>
      )}
    </Modal>
  )
}
