import {ExpenseStatus} from "@/entities/expense/model/types.ts";

export const statusClassMap: Record<ExpenseStatus, string> = {
    confirmed: 'border-[#86d8a1] bg-green-light text-[#37ac62]',
    pending: 'border-yellow bg-[#fff9de] text-[#bda21b]',
    disputed: 'border-[#f698a4] bg-error-light text-error',
}

export const statusLabelMap: Record<ExpenseStatus, string> = {
    confirmed: 'Подтверждён',
    pending: 'На проверке',
    disputed: 'Оспорен',
}


export const actionButtonClassName = "h-[34px] w-[34px] border-[1.5px] sm:p-[9px] rounded-[9px] sm:h-[45px] sm:w-[45px]"
export const actionButtonIconClassName = "h-[24px] w-[24px]"