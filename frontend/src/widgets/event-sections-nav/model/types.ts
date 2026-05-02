export enum EventSection {
  expenses = 'expenses',
  settlements = 'settlements',
  participants = 'participants',
  history = 'history',
}

export type EventSectionTab = {
  key: EventSection
  label: string
}
