import {
  createDateField,
  createFields,
  createImageField,
  createTextAreaField,
  createTextField,
  type FormFieldConfig,
} from '@/shared/lib/forms'

import type { CreateEventFormValues } from '../model/types.ts'
import {
  createEventFieldInputClassName,
  createEventFieldLabelClassName
} from '../ui/create-event-form.constants.tsx'

export const getCreateEventFormFields = (): FormFieldConfig<CreateEventFormValues>[] =>
  createFields<CreateEventFormValues>([
    createTextField<CreateEventFormValues>({
      name: 'title',
      type: 'text',
      label: 'Название события',
      labelClassName: createEventFieldLabelClassName,
      fieldClassName: createEventFieldInputClassName,
      placeholder: 'Например: Поездка в Сочи',
      required: true,
    }),
    createDateField<CreateEventFormValues>({
      name: 'startDate',
      type: 'date',
      label: 'Дата начала',
      labelClassName: createEventFieldLabelClassName,
      fieldClassName: `${createEventFieldInputClassName}`,
      placeholder: 'дд.мм.гггг',
      required: true,
      calendarIconSize: "24px"
    }),
    createDateField<CreateEventFormValues>({
      name: 'endDate',
      type: 'date',
      label: 'Дата конца',
      labelClassName: createEventFieldLabelClassName,
      fieldClassName: `${createEventFieldInputClassName}`,
      placeholder: 'дд.мм.гггг',
      calendarIconSize: "24px"
    }),
    createTextAreaField<CreateEventFormValues>({
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      labelClassName: createEventFieldLabelClassName,
      fieldClassName: `${createEventFieldInputClassName} h-[150px] resize-none`,
      placeholder: 'Опишите детали события...',
      rows: 4,
    }),
    createImageField<CreateEventFormValues>({
      name: 'avatar',
      type: 'image',
      label: 'Аватарка',
      labelClassName: createEventFieldLabelClassName,
      fieldClassName: `${createEventFieldInputClassName} px-0 py-0`,
      accept: 'image/*',
    }),
  ])
