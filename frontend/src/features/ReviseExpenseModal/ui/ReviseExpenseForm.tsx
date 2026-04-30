import { FormProvider, useForm } from 'react-hook-form'
import {ReviseExpenseFormFields, reviseExpenseFormOutput} from '@/features/ReviseExpenseModal/model/types.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviseExpenseSchema } from '@/features/ReviseExpenseModal/model/schema.ts'
import { getReviseExpenseFormFields } from '@/features/ReviseExpenseModal/lib/getReviseExpenseFormFields.ts'
import { renderFormField } from '@/shared/ui/form'
import { CheckField } from '@/features/ReviseExpenseModal/ui/CheckField.tsx'
import { reviseCommentMaxLength } from '@/features/ReviseExpenseModal/model/constants.ts'
import { Text } from '@/shared/ui/text/Text.tsx'
import { Button } from '@/shared/ui/button/Button.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'
import { ExpenseCategory } from '@/entities/expense'

type ReviseExpenseFormProps = {
  defaultValues: reviseExpenseFormOutput
  onClose: () => void
}

const categories: ExpenseCategory[] = ['Проживание', 'Еда', 'Транспорт', 'Развлечения']

export const ReviseExpenseForm = ({ defaultValues, onClose }: ReviseExpenseFormProps) => {
  const methods = useForm<reviseExpenseFormOutput>({
    resolver: zodResolver(reviseExpenseSchema),
    mode: 'onTouched',
    defaultValues,
  })

  const { handleSubmit, reset, watch } = methods

  const { categoryField, commentField, amountField, checkField }: ReviseExpenseFormFields = getReviseExpenseFormFields({
    categories,
  })

  const commentValue = watch('comment')

  const resetModalState = () => {
    reset(defaultValues)
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  const submitForm = handleSubmit((values) => {
    console.log(values)
    handleClose()
  })

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col gap-[10px]" onSubmit={submitForm}>
        <div className="flex flex-col gap-[10px] sm:flex-row sm:gap-[23px]">
          {renderFormField(amountField)}
          {renderFormField(categoryField)}
        </div>
        <CheckField key={checkField.name} {...checkField} />
        <div className="flex flex-col text-[12px] font-semibold">
          {renderFormField(commentField)}
          <span className="ml-auto justify-self-end">
            {commentValue?.length ?? 0}/{reviseCommentMaxLength}
          </span>
        </div>
        <div className="flex flex-col-reverse justify-between gap-[10px] sm:flex-row">
          <Text variant="caption" className="text-placeholder">
            Перед отправкой убедитесь, что внесли все необходимые правки
          </Text>
          <div className="flex gap-[10px]">
            <Button type="submit" variant={ButtonEnum.Primary}>
              Отправить
            </Button>
            <Button type="button" variant={ButtonEnum.Secondary} onClick={handleClose}>
              Отмена
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
