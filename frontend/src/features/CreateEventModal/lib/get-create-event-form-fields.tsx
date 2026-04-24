import {
  createDateField,
  createImageField,
  createTextAreaField,
  createTextField,
  type FormFieldConfig,
} from '@/shared/lib/forms'
import type { CreateEventFormValues } from '../model/types.ts'

import {
  createEventFieldInputClassName,
  createEventFieldLabelClassName,
} from '../model/constants.ts'
import { FormFieldVariant } from '@/shared/lib/forms/types.ts'

type CreateEventFormFields = {
  titleField: FormFieldConfig<CreateEventFormValues>
  dateFields: [FormFieldConfig<CreateEventFormValues>, FormFieldConfig<CreateEventFormValues>]
  descriptionField: FormFieldConfig<CreateEventFormValues>
  avatarField: FormFieldConfig<CreateEventFormValues>
}

export const getCreateEventFormFields = (): CreateEventFormFields => {
  const titleField = createTextField<CreateEventFormValues>({
    name: 'title',
    type: 'text',
    label: 'Название события',
    labelClassName: createEventFieldLabelClassName,
    fieldClassName: createEventFieldInputClassName,
    placeholder: 'Например: Поездка в Сочи',
    required: true,
  })

  const startDateField = createDateField<CreateEventFormValues>({
    name: 'startDate',
    type: 'date',
    label: 'Дата начала',
    labelClassName: createEventFieldLabelClassName,
    fieldClassName: createEventFieldInputClassName,
    placeholder: 'дд.мм.гггг',
    required: true,
    calendarIconSize: '24px',
  })

  const endDateField = createDateField<CreateEventFormValues>({
    name: 'endDate',
    type: 'date',
    label: 'Дата конца',
    labelClassName: createEventFieldLabelClassName,
    fieldClassName: createEventFieldInputClassName,
    placeholder: 'дд.мм.гггг',
    calendarIconSize: '24px',
  })

  const descriptionField = createTextAreaField<CreateEventFormValues>({
    name: 'description',
    type: 'textarea',
    label: 'Описание',
    labelClassName: createEventFieldLabelClassName,
    fieldClassName: `${createEventFieldInputClassName} h-[146px] sm:h-[150px] resize-none`,
    placeholder: 'Опишите детали события...',
    rows: 4,
  })

  const avatarField = createImageField<CreateEventFormValues>({
    name: 'avatar',
    type: 'image',
    label: 'Аватарка',
    labelClassName: createEventFieldLabelClassName,
    fieldClassName: `bg-secondary h-[155px] w-full px-[0px] py-[0px] w-fit sm:w-[150px]`,
    accept: 'image/*',
    variant: FormFieldVariant.Outlined,
  })

  return {
    titleField,
    dateFields: [startDateField, endDateField],
    descriptionField,
    avatarField,
  }
}
