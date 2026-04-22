import AddIcon from '@/shared/assets/icons/add.svg?react'
import WarningIcon from '@/shared/assets/icons/warning.svg?react'
import CheckIcon from '@/shared/assets/icons/check.svg?react'
import TrashIcon from '@/shared/assets/icons/trash.svg?react'
import EditIcon from '@/shared/assets/icons/edit.svg?react'


import {Button} from '@/shared/ui/button/Button'
import { Text } from '@/shared/ui/text/Text'
import {ExpenseListItem, ExpenseStatus} from "@/entities/expense/model/types.ts";
import {
  actionButtonClassName,
  actionButtonIconClassName,
  statusClassMap,
  statusLabelMap
} from "@/widgets/event-expenses/model/contstants.ts";


import clsx from "clsx";
import {formatPrice} from "@/shared/lib/number/format-price.ts";
import {ButtonEnum} from "@/shared/ui/button/constants.ts";

const expenses: ExpenseListItem[] = [
  {
    id: 1,
    title: 'Бронирование отеля',
    category: 'Проживание',
    approvalStatus: ExpenseStatus.Confirmed,
    payerName: 'Иван Петров',
    splitBetweenCount: 5,
    createdAt: '15.06.2026 14:33',
    amount: 45000,
    perPersonalAmount: 9000,
  },
  {
    id: 2,
    title: 'Билеты на самолёт',
    category: 'Транспорт',
    approvalStatus: ExpenseStatus.Pending,
    payerName: 'Иван Петров',
    splitBetweenCount: 5,
    createdAt: '15.06.2026 14:33',
    amount: 45000,
    perPersonalAmount: 9000,
  },
  {
    id: 3,
    title: 'Ужин в ресторане',
    category: 'Проживание',
    approvalStatus: ExpenseStatus.Disputed,
    payerName: 'Иван Петров',
    splitBetweenCount: 5,
    createdAt: '15.06.2026 14:33',
    amount: 45000,
    perPersonalAmount: 9000,
    disputeInfo: {
      reason: 'Сумма указана неверно, не совпадает с чеком.',
      timestamp: '15.06.2026 14:33'
    }
  }
]

export const EventExpensesWidget = () => {
  return (
    <section className="flex flex-col gap-[15px] sm:gap-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row items-center sm:justify-center gap-[10px]">
          <Text variant="h1" as="h1">Список расходов</Text>
          <Text className="font-normal text-muted text-h3-d sm:text-h2-d">{expenses.length}</Text>
        </div>
        <Button
          type="button"
          className="w-fit h-[30px] sm:h-[47px] py-[2px] gap-[10px] rounded-[10px] sm:rounded-[16px] bg-yellow px-[16px] sm:px-[30px]"
        >
          <AddIcon className="h-[24px] w-[24px]" />
          <Text variant="h2" className="font-normal">Добавить расход</Text>
        </Button>
      </div>

      <div className="overflow-hidden rounded-[16px] border-[2px] border-primary bg-secondary">
        {expenses.map((expense) => (
          <div key={expense.id} className="border-b-[2px] border-secondary py-[10px] px-[10px] sm:pl-[32px] sm:py-[20px] sm:pr-[35px] last:border-b-0">
            <div className="flex gap-[10px] flex-col sm:flex-row items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-[10px] sm:gap-[20px]">
                  <Text className="text-h3-d sm:text-h2-d ">{expense.title}</Text>
                  <div className="flex gap-[10px] sm:gap-[20px]">
                      <div
                        className="w-fit flex rounded-[48px] h-[30px] sm:h-[42px] px-[16px] sm:px-[30px] items-center justify-center bg-yellow"
                      >
                        <Text variant="h3" className="font-normal">{expense.category}</Text>
                      </div>
                      <div
                        className={clsx(
                            "flex w-[142px] sm:w-[200px] rounded-[48px] h-[30px] sm:h-[42px] items-center justify-center border",
                            statusClassMap[expense.approvalStatus]
                          )}
                      >
                        <Text variant="h3" className="font-normal">{statusLabelMap[expense.approvalStatus]}</Text>
                      </div>
                  </div>
                </div>

                <div className="mt-[4px] flex flex-wrap gap-[2px] sm:gap-[40px] text-h3-d text-muted">
                  <Text variant="h3" className="font-normal">Оплатил: {expense.payerName}</Text>
                  <Text variant="h3" className="font-normal">Разделено между: {expense.splitBetweenCount} чел.</Text>
                  <Text variant="h3" className="font-normal">{expense.createdAt}</Text>
                </div>

              </div>

              <div className="flex h-[90px] sm:h-auto flex-row gap-[24px] sm:items-center">
                <div className="flex gap-[8px] mt-auto sm:mt-0">
                  <Button
                      variant={ButtonEnum.Secondary}
                      className={actionButtonClassName}
                  >
                      <EditIcon className={actionButtonIconClassName} />
                  </Button>
                  <Button
                      variant={ButtonEnum.Secondary}
                      className={actionButtonClassName}
                  >
                      <TrashIcon className={actionButtonIconClassName} />
                  </Button>
                  <Button
                      variant={ButtonEnum.Tertialy}
                      className={actionButtonClassName}
                  >
                      <WarningIcon className={actionButtonIconClassName} />
                  </Button>
                  <Button
                      variant={ButtonEnum.Empty}
                      className={clsx(
                          actionButtonClassName,
                          'border-green bg-green-light',
                      )
                      }
                  >
                      <CheckIcon className={actionButtonIconClassName} />
                  </Button>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <Text className="text-right text-h3-d">{formatPrice(expense.amount)}</Text>
                  <Text className="text-right text-h3-d text-muted">{formatPrice(expense.perPersonalAmount)} / чел</Text>
                </div>
              </div>
            </div>
              <>
              {expense.disputeInfo ? (
                  <div className="flex w-full max-w-[862px] flex-col sm:h-[95px] mt-[10px] rounded-[16px] border border-error bg-error-light p-[10px] sm:px-[25px] sm:py-[10px] text-error">
                      <Text variant="h3" className="font-semibold">Причина: {expense.disputeInfo.reason}</Text>
                      <Text variant="h3" className="font-normal">Время: {expense.disputeInfo.timestamp}</Text>
                  </div>
              ) : null}
              </>
          </div>
        ))}
      </div>
    </section>
  )
}
