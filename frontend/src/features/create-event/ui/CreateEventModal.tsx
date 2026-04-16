import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button/Button.tsx'
import { renderFormField } from "@/shared/ui/form";

import { Modal } from '@/shared/ui/modal'

import { getCreateEventFormFields } from '../lib/get-create-event-form-fields.tsx'
import { useExpenseCategories } from '../lib/use-expense-categories.ts'
import { createEventSchema } from '../model/schema.ts'
import type { CreateEventFormValues } from '../model/types.ts'
import { createEventFormDefaultValues } from './create-event-form.constants.tsx'
import { ExpenseCategoriesSection } from './ExpenseCategoriesSection.tsx'

import CloseIcon from '@/shared/assets/icons/close.svg?react'

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
  } = useExpenseCategories()

  const createEventFields = getCreateEventFormFields()
  const titleField = createEventFields.find((field) => field.name === 'title')
  const dateFields = createEventFields.filter((field) => field.type === 'date')
  const descriptionField = createEventFields.find((field) => field.name === 'description')
  const avatarField = createEventFields.find((field) => field.name === 'avatar')

  const { handleSubmit, reset } = methods

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
      categories,
      categoryInput,
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
    <Modal isOpen={isOpen} onClose={handleClose} className="w-[964px] overflow-hidden rounded-[24px]">
      <div className="overflow-y-auto px-[30px] py-[24px]">
        <div className="mb-[10px] flex items-center justify-between gap-4">
          <p className="text-h2-d font-medium text-primary">Создание события</p>
          <Button
            aria-label="close-create-event-modal"
            className="text-[42px] leading-none text-primary transition-opacity hover:opacity-70"
            onClick={handleClose}
          >
            <CloseIcon width="24px" height="24px" />
          </Button>
        </div>

        <FormProvider {...methods}>
          <form className="flex flex-col gap-[20px]" onSubmit={submitForm}>
            {titleField ? renderFormField(titleField) : null}

            <div className="flex flex-row gap-[23px]">{dateFields.map(renderFormField)}</div>

            <div className="flex flex-row gap-[20px]">
              {descriptionField ? (
                    renderFormField(descriptionField)
              ) : null}
              {avatarField ?  renderFormField(avatarField) : null}
              </div>
            <ExpenseCategoriesSection
              categories={categories}
              categoryInput={categoryInput}
              onAddCategory={addCategory}
              onCategoryInputChange={setCategoryInput}
              onRemoveCategory={removeCategory}
            />

            <div className="pt-[12px]">
              <Button
                type="submit"
                className="rounded-[16px] border-[2px] border-yellow bg-yellow px-[45px] py-[8px] text-h3 font-medium text-primary"
              >
                Создать
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
