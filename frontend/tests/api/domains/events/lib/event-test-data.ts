export const eventTestData = {
  eventPrefixes: {
    default: 'qa_api_event',
    create: 'qa_api_event_create',
    get: 'qa_api_event_get',
    update: 'qa_api_event_update',
    anonymous: 'qa_api_event_anon',
    expensesList: 'qa_expenses_event',
    expensesCreate: 'qa_expenses_event_create',
    participants: 'qa_participants_event',
  },
  loginPrefixes: {
    list: 'qa_events_list',
    create: 'qa_events_create',
    get: 'qa_events_get',
    update: 'qa_events_update',
    expensesList: 'qa_expenses_list',
    expensesCreate: 'qa_expenses_create',
    participantsOwner: 'qa_participants_owner',
  },
  ids: {
    emptyUuid: '00000000-0000-0000-0000-000000000000',
  },
} as const

export function buildCreateEventPayload(prefix: string = eventTestData.eventPrefixes.default) {
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    title: `${prefix}_${stamp}`,
    description: 'Автотестовое событие',
    startDate: new Date('2030-01-10T10:00:00.000Z').toISOString(),
    endDate: new Date('2030-01-12T18:00:00.000Z').toISOString(),
    imageKey: '',
    categories: ['Транспорт', 'Проживание'],
  }
}
