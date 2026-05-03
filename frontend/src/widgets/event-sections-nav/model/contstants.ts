import type { EventSectionTab } from './types.ts'
import { EventSection } from './types.ts'

export const tabs: EventSectionTab[] = [
  { key: EventSection.expenses, label: 'Расходы' },
  { key: EventSection.settlements, label: 'Взаиморасчёты' },
  { key: EventSection.participants, label: 'Участники' },
  { key: EventSection.history, label: 'История' },
]

export const eventSections = Object.values(EventSection) as EventSection[]
export const eventDefaultSection = EventSection.expenses
