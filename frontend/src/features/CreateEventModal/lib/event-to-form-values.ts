import { EventResponse } from '@/entities/event/model/types'
import { CreateEventFormValues } from '../model/types'

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export const eventToFormValues = (event: EventResponse): CreateEventFormValues => ({
  avatar: undefined,
  categories: event.categories ?? [],
  description: event.description ?? '',
  startDate: toDateInputValue(event.startDate),
  endDate: toDateInputValue(event.endDate),
  title: event.title,
})
