import {
  createNumberField,
  createSelectField,
  createTextAreaField,
  FormOption,
} from '@/shared/lib/forms'

import { ExpenseCategory } from '@/entities/expense'
import {
  reviseExpenseFieldInputClassName,
  reviseExpenseFieldLabelClassName,
} from '@/features/ReviseExpenseModal/model/constants.ts'
import {
  ReviseExpenseFormFields,
  ReviseExpenseFormValues,
  ReviseFieldConfig,
} from '@/features/ReviseExpenseModal/model/types.ts'

type ReviseExpenseFormProps = {
  categories: ExpenseCategory[]
}

export const getReviseExpenseFormFields = ({
  categories,
}: ReviseExpenseFormProps): ReviseExpenseFormFields => {
  const categoriesOptions: FormOption[] = categories.map(
    (category): FormOption => ({
      value: category,
      label: category,
    }),
  )

  const amountField = createNumberField<ReviseExpenseFormValues>({
    name: 'amount',
    type: 'number',
    labelClassName: reviseExpenseFieldLabelClassName,
    fieldClassName: reviseExpenseFieldInputClassName,
    label: 'Сумма, руб',
    min: 0,
    max: 1_000_000_000_000_000,
    step: 0.01,
    placeholder: 'Введите сумму',
    withoutClearButton: true,
    required: true,
  })

  const categoryField = createSelectField<ReviseExpenseFormValues>({
    name: 'category',
    labelClassName: reviseExpenseFieldLabelClassName,
    fieldClassName: reviseExpenseFieldInputClassName,
    type: 'select',
    label: 'Категория',
    options: categoriesOptions,
    required: true,
  })

  const commentField = createTextAreaField<ReviseExpenseFormValues>({
    name: 'comment',
    type: 'textarea',
    labelClassName: reviseExpenseFieldLabelClassName,
    fieldClassName: `${reviseExpenseFieldInputClassName} h-[110px] resize-none`,
    label: 'Комментарий',
    required: true,
    placeholder: 'Добавьте короткие пояснения что именно было исправлено',
  })

  const checkField: ReviseFieldConfig<ReviseExpenseFormValues> = {
    name: 'checkImage',
    type: 'image',
    label: 'Чек или подтверждающий документ',
    required: true,
    accept: 'image/*,.pdf,application/pdf',
    labelClassName: reviseExpenseFieldLabelClassName,
    fieldClassName: reviseExpenseFieldInputClassName,
  }

  return {
    checkField,
    amountField,
    commentField,
    categoryField,
  }
}
