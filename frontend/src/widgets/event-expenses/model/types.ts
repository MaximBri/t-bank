import {ExpenseCategory} from "@/entities/expense";
import {ExpenseStatus} from "@/entities/expense/model/types.ts";

export type ExpenseItem = {
    id: string
    title: string
    category: ExpenseCategory
    status: ExpenseStatus
    paidBy: string
    splitBetween: string
    dateTime: string
    amount: string
    amountPerPerson: string
    hasAlert?: boolean
    disputeMessage?: string
}