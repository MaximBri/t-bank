import clsx from 'clsx'
import { useState } from 'react'

import CheckIcon from '@/shared/assets/icons/check.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import EyeIcon from '@/shared/assets/icons/eye.svg?react'

import { ExpensePreviewModal } from './ExpensePreviewModal.tsx'

import { Button } from '@/shared/ui/button/Button'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { Text } from '@/shared/ui/text/Text'

import { ExpenseResponseStatus, type ExpenseResponseDto } from '@/entities/expense'

import {
  actionButtonClassName,
  actionButtonIconClassName,
  serverStatusClassMap,
  serverStatusLabelMap,
} from '@/widgets/event-expenses/model/contstants.ts'
import { formatExpenseDate } from '@/widgets/event-expenses/lib/format-expense-date.ts'

import { formatPrice } from '@/shared/lib/number/format-price.ts'

type ExpenseRowProps = {
  expense: ExpenseResponseDto
  payerName: string
  isMutating: boolean
  canDecideShare: boolean
  onConfirmShare: () => void
  onRejectShare: () => void
}

export const ExpenseRow = ({
  expense,
  payerName,
  isMutating,
  canDecideShare,
  onConfirmShare,
  onRejectShare,
}: ExpenseRowProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const category = expense.categories[0]
  const totalPeople = expense.totalParticipantsCount + 1
  const perPerson = totalPeople > 0 ? Math.ceil(expense.totalAmount / totalPeople) : 0
  const canDecideExpense = canDecideShare && expense.status === ExpenseResponseStatus.Pending

  return (
    <>
    <div className="border-b-[2px] border-secondary py-[10px] px-[10px] sm:pl-[32px] sm:py-[20px] sm:pr-[35px] last:border-b-0">
      <div className="flex gap-[10px] flex-col sm:flex-row items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-[10px] sm:gap-[20px]">
            <div className="min-w-0 max-w-full" title={expense.title}>
              <Text className="truncate text-h3-d sm:text-h2-d">{expense.title}</Text>
            </div>
            <div className="flex gap-[10px] sm:gap-[20px]">
              {category ? (
                <div className="w-fit flex rounded-[48px] h-[30px] sm:h-[42px] px-[16px] sm:px-[30px] items-center justify-center bg-yellow">
                  <Text variant="h3" className="font-normal">
                    {category}
                  </Text>
                </div>
              ) : null}
              <div
                className={clsx(
                  'flex w-[142px] sm:w-[200px] rounded-[48px] h-[30px] sm:h-[42px] items-center justify-center border',
                  serverStatusClassMap[expense.status],
                )}
              >
                <Text variant="h3" className="font-normal">
                  {serverStatusLabelMap[expense.status]}
                </Text>
              </div>
            </div>
          </div>

          <div className="mt-[4px] flex flex-wrap gap-[2px] sm:gap-[40px] text-h3-d text-muted">
            <Text variant="h3" className="font-normal">
              Оплатил: {payerName}
            </Text>
            <Text variant="h3" className="font-normal">
              Разделено между: {totalPeople} чел.
            </Text>
            <Text variant="h3" className="font-normal">
              {formatExpenseDate(expense.createdAt)}
            </Text>
          </div>
        </div>

        <div className="flex h-[90px] sm:h-auto shrink-0 flex-row gap-[24px] sm:items-center">
          <div className="flex gap-[8px] mt-auto sm:mt-0">
            <Button
              variant={ButtonEnum.Secondary}
              className={actionButtonClassName}
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Посмотреть расход"
            >
              <EyeIcon className={actionButtonIconClassName} />
            </Button>
            {canDecideExpense ? (
              <>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={onRejectShare}
                  className={clsx(
                    actionButtonClassName,
                    'flex items-center justify-center border-error bg-error-light disabled:opacity-60',
                  )}
                  aria-label="Отклонить расход"
                  title="Отклонить расход"
                >
                  <CloseIcon className={clsx(actionButtonIconClassName, 'text-error')} />
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={onConfirmShare}
                  className={clsx(
                    actionButtonClassName,
                    'flex items-center justify-center border-green bg-green-light disabled:opacity-60',
                  )}
                  aria-label="Подтвердить расход"
                  title="Подтвердить расход"
                >
                  <CheckIcon className={actionButtonIconClassName} />
                </button>
              </>
            ) : null}
          </div>
          <div className="flex flex-col gap-[3px]">
            <Text className="text-right text-h3-d">{formatPrice(expense.totalAmount)}</Text>
            <Text className="text-right text-h3-d text-muted">
              {formatPrice(perPerson)} / чел
            </Text>
          </div>
        </div>
      </div>
    </div>
    <ExpensePreviewModal
      isOpen={isPreviewOpen}
      onClose={() => setIsPreviewOpen(false)}
      expense={expense}
      payerName={payerName}
    />
    </>
  )
}
