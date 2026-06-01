export const expenseTestData = {
  expensePrefixes: {
    default: 'qa_api_expense',
    create: 'qa_expense_create',
    anonymous: 'qa_expense_anon',
  },
} as const

export function buildCreateExpensePayload(prefix: string = expenseTestData.expensePrefixes.default) {
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    title: `${prefix}_${stamp}`,
    description: 'Автотестовый расход',
    total_amount: 1000,
    image_key: '',
    categories: ['Транспорт'],
    participant_ids: ['00000000-0000-0000-0000-000000000000'],
  }
}
