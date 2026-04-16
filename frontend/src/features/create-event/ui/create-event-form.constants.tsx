import type { CreateEventFormValues } from '../model/types.ts'

export const createEventFormDefaultValues: CreateEventFormValues = {
  avatar: undefined,
  description: '',
  endDate: undefined,
  startDate: '',
  title: '',
}

export const createEventFieldLabelClassName = 'text-body sm:text-h3-d font-medium text-primary'
export const createEventFieldInputClassName =
  'border-primary bg-primary px-[16px] py-[10px] text-body text-medium border-[2px] rounded-[16px]'
