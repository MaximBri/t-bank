import clsx from 'clsx'

import { Modal } from '@/shared/ui/modal'
import { Text } from '@/shared/ui/text/Text'
import ImageIcon from '@/shared/assets/icons/image-filled.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'

import { type ExpenseResponseDto } from '@/entities/expense'

import {
  serverStatusClassMap,
  serverStatusLabelMap,
} from '@/widgets/event-expenses/model/contstants.ts'
import { formatExpenseDate } from '@/widgets/event-expenses/lib/format-expense-date.ts'
import { formatPrice } from '@/shared/lib/number/format-price.ts'

type ExpensePreviewModalProps = {
  isOpen: boolean
  onClose: () => void
  expense: ExpenseResponseDto
  payerName: string
}

export const ExpensePreviewModal = ({
  isOpen,
  onClose,
  expense,
  payerName,
}: ExpensePreviewModalProps) => {
  const category = expense.categories[0]
  const totalPeople = expense.totalParticipantsCount + 1
  const perPerson = totalPeople > 0 ? expense.totalAmount / totalPeople : 0
  const isPdf = expense.imageUrl ? expense.imageUrl.includes('.pdf') : false

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[320px] rounded-lg bg-secondary sm:w-[640px]"
    >
      <div className="flex flex-col gap-[16px] p-[15px] sm:px-[30px] sm:py-[24px]">
        <div className="flex justify-end">
          <button
            aria-label="close-expense-preview-modal"
            className="transition-opacity hover:opacity-70"
            onClick={onClose}
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-[10px] sm:gap-[20px]">
          <Text as="h2" variant="h2" className="text-h3-d sm:text-h2-d">
            {expense.title}
          </Text>
          {category ? (
            <div className="flex h-[30px] w-fit items-center justify-center rounded-[48px] bg-yellow px-[16px] sm:h-[42px] sm:px-[30px]">
              <Text variant="h3" className="font-normal">
                {category}
              </Text>
            </div>
          ) : null}
          <div
            className={clsx(
              'flex h-[30px] items-center justify-center rounded-[48px] border px-[16px] sm:h-[42px] sm:px-[30px]',
              serverStatusClassMap[expense.status],
            )}
          >
            <Text variant="h3" className="font-normal">
              {serverStatusLabelMap[expense.status]}
            </Text>
          </div>
        </div>

        {expense.description ? (
          <Text variant="h3" className="font-normal text-muted">
            {expense.description}
          </Text>
        ) : null}

        <div className="flex flex-col gap-[6px] text-h3-d text-muted">
          <Text variant="h3" className="font-normal">
            Оплатил: {payerName}
          </Text>
          <Text variant="h3" className="font-normal">
            Сумма: {formatPrice(expense.totalAmount)}
          </Text>
          <Text variant="h3" className="font-normal">
            {formatPrice(Math.round(perPerson))} / чел · {totalPeople} чел.
          </Text>
          <Text variant="h3" className="font-normal">
            {formatExpenseDate(expense.createdAt)}
          </Text>
        </div>

        <div className="flex h-[260px] w-full items-center justify-center overflow-hidden rounded-[12px] bg-primary">
          {expense.imageUrl ? (
            isPdf ? (
              <iframe
                src={expense.imageUrl}
                title="Чек"
                className="h-full w-full"
              />
            ) : (
              <img
                src={expense.imageUrl}
                alt="Чек"
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-[8px] text-muted">
              <ImageIcon width={60} height={60} />
              <Text variant="h3" className="font-normal">
                Чек не приложен
              </Text>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
