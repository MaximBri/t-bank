export type ExpenseCategory = string

export type ExpenseCategoryList = ExpenseCategory[]

export enum ExpenseStatus {
  Confirmed = 'confirmed',
  Pending = 'pending',
  Disputed = 'disputed',
}

export type Expense = {
  id: number
  amount: number
  category: ExpenseCategory
  participants: number[]
  title: string
  payerName: string
}

type Dispute = {
  reason: string
  timestamp: string
}

export type ExpenseListItem = Omit<
  Expense & {
    approvalStatus: ExpenseStatus
    perPersonalAmount: number
    disputeInfo?: Dispute
    createdAt: string
    splitBetweenCount: number
  },
  'participants'
>
