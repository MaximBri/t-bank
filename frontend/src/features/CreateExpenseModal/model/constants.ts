import {CreateExpenseFormValues} from '@/features/CreateExpenseModal/model/types.ts'

export const createExpenseFormDefaultValues: CreateExpenseFormValues = {
    title: '',
    amount: undefined,
    category: '',
    participants: [],
    comment: undefined,
    checkImage: undefined,
}


export const createExpenseFieldLabelClassName = 'text-body sm:text-h3-d font-medium'
export const createExpenseFieldInputClassName =
    'px-[16px] py-[10px] text-body text-medium'