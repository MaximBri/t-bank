import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { Button } from '@/shared/ui/button/Button.tsx'
import { renderFormField } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'

import { getCreateEventFormFields } from '../lib/get-create-event-form-fields.tsx'
import { useExpenseCategories } from '../lib/use-expense-categories.ts'
import { createEventSchema } from '../model/schema.ts'
import type { CreateEventFormValues } from '../model/types.ts'
import { ExpenseCategoriesSection } from './ExpenseCategoriesSection.tsx'
import { createEventFormDefaultValues } from '../model/constants.ts'
import { Text } from '@/shared/ui/text/Text.tsx'
import { ButtonEnum } from '@/shared/ui/button/constants.ts'

type CreateEventModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    mode: 'onTouched',
    defaultValues: createEventFormDefaultValues,
  })
  const {
    addCategory,
    categories,
    categoryInput,
    removeCategory,
    resetCategories,
    setCategoryInput,
  } = useExpenseCategories(methods)

  const { titleField, dateFields, descriptionField, avatarField } = getCreateEventFormFields()

  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = methods

  const resetModalState = () => {
    reset(createEventFormDefaultValues)
    resetCategories()
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  const submitForm = handleSubmit((values) => {
    const data = {
      ...values,
      avatar: values.avatar
        ? {
            name: values.avatar.name,
            size: values.avatar.size,
            type: values.avatar.type,
          }
        : undefined,
    }
    console.log(data)
    handleClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-[320px] rounded-lg bg-secondary sm:w-[964px]"
    >
      <div className="p-[15px] sm:px-[30px] sm:py-[24px]">
        <div className="mb-[10px] flex items-center justify-between gap-4">
          <Text as="h2" variant="h2">
            Создание события
          </Text>
          <Button
            aria-label="close-create-event-modal"
            className="transition-opacity hover:opacity-70"
            onClick={handleClose}
            variant={ButtonEnum.Empty}
          >
            <CloseIcon width={20} height={20} />
          </Button>
        </div>

        <FormProvider {...methods}>
          <form className="flex flex-col gap-[10px] sm:gap-[20px]" onSubmit={submitForm}>
            {renderFormField(titleField)}

            <div className="flex flex-col gap-[10px] sm:flex-row sm:gap-[23px]">
              {dateFields.map(renderFormField)}
            </div>

            <div className="flex flex-col gap-[10px] sm:flex-row sm:gap-[20px]">
              {renderFormField(descriptionField)}
              {renderFormField(avatarField)}
            </div>

            <ExpenseCategoriesSection
              categories={categories}
              categoryInput={categoryInput}
              errorMessage={errors.categories?.message}
              onAddCategory={addCategory}
              onCategoryInputChange={setCategoryInput}
              onRemoveCategory={removeCategory}
            />

            <div className="sm:pt-[12px]">
              <Button type="submit" className="font-medium">
                Создать
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
