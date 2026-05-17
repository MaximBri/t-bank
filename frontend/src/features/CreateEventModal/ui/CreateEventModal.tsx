import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useExpenseCategories } from '@/entities/expense'

import CloseIcon from '@/shared/assets/icons/close.svg?react'
import { Button } from '@/shared/ui/button/Button.tsx'
import { renderFormField } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { s3Api } from '@/shared/api/s3Api.ts'

import { getCreateEventFormFields } from '../lib/get-create-event-form-fields.tsx'
import { eventToFormValues } from '../lib/event-to-form-values.ts'
import { createEventSchema } from '../model/schema.ts'
import { createEventFormDefaultValues } from '../model/constants.ts'
import { ExpenseCategoriesSection } from './ExpenseCategoriesSection.tsx'

import type { CreateEventFormFields, CreateEventFormValues } from '../model/types.ts'

import { Text } from '@/shared/ui/text/Text.tsx'
import { CreateEventDto, EventResponse } from '@/entities/event/model/types.ts'
import { useCreateEvent } from '@/entities/event/api/hooks/useCreateEvent.ts'
import { useUpdateEvent } from '@/entities/event/api/hooks/useUpdateEvent.ts'

type CreateEventModalProps = {
  isOpen: boolean
  onClose: () => void
  event?: EventResponse
}

export const CreateEventModal = ({ isOpen, onClose, event }: CreateEventModalProps) => {
  const isEdit = !!event

  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    mode: 'onTouched',
    defaultValues: createEventFormDefaultValues,
  })
  const { mutate: createEvent } = useCreateEvent()
  const { mutate: updateEvent } = useUpdateEvent(event?.id ?? '')

  const {
    addCategory,
    categories,
    categoryInput,
    removeCategory,
    resetCategories,
    setCategoryInput,
  } = useExpenseCategories(methods)

  const { titleField, dateFields, descriptionField, avatarField }: CreateEventFormFields =
    getCreateEventFormFields()

  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = methods

  useEffect(() => {
    if (!isOpen) return
    reset(event ? eventToFormValues(event) : createEventFormDefaultValues)
  }, [isOpen, event, reset])

  const resetModalState = () => {
    reset(createEventFormDefaultValues)
    resetCategories()
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    let imageKey = ''
    if (values.avatar) {
      try {
        imageKey = await s3Api.uploadFile(values.avatar)
      } catch {
        toast.error('Не удалось загрузить изображение')
        return
      }
    }

    const data: CreateEventDto = {
      title: values.title,
      description: values.description,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      imageKey,
      categories: values.categories,
    }

    if (isEdit) {
      updateEvent(data, {
        onSuccess: () => {
          toast.success('Событие обновлено')
          handleClose()
        },
        onError: () => toast.error('Не удалось обновить событие'),
      })
    } else {
      createEvent(data, {
        onSuccess: () => {
          toast.success('Событие создано')
          handleClose()
        },
        onError: () => toast.error('Не удалось создать событие'),
      })
    }
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
            {isEdit ? 'Редактирование события' : 'Создание события'}
          </Text>
          <button
            aria-label="close-create-event-modal"
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
              {dateFields.map(renderFormField)}
            </div>

            <div className="flex flex-col gap-[10px] sm:flex-row sm:gap-[20px]">
              {renderFormField(descriptionField)}
              <div className="sm:max-w-[150px]">{renderFormField(avatarField)}</div>
            </div>

            <ExpenseCategoriesSection
              categories={categories}
              categoryInput={categoryInput}
              errorMessage={errors.categories?.message}
              onAddCategory={addCategory}
              onCategoryInputChange={setCategoryInput}
              onRemoveCategory={removeCategory}
            />

            <div className="sm:pt-[20px]">
              <Button type="submit" className="font-medium w-[200px]">
                {isEdit ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Modal>
  )
}
