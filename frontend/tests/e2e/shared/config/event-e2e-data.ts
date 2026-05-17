import type { CreateEventDto } from '@/entities/event/model/types'

export const eventE2eData = {
  defaultCategories: ['Транспорт', 'Проживание'],
  eventPrefixes: {
    smoke: 'qa_smoke_event',
  },
} as const

export function buildCreateEventPayload(prefix = eventE2eData.eventPrefixes.smoke): CreateEventDto {
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    title: `${prefix}_${stamp}`,
    description: 'Автотестовое событие',
    startDate: new Date('2030-01-10T10:00:00.000Z').toISOString(),
    endDate: new Date('2030-01-12T18:00:00.000Z').toISOString(),
    imageKey: '',
    categories: [...eventE2eData.defaultCategories],
  }
}
