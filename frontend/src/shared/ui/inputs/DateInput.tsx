import clsx from 'clsx'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import { BaseInput, BaseInputProps } from './BaseInput.tsx'

type DateInputProps = Omit<BaseInputProps, 'type'>

export const DateInput = ({ className, ...props }: DateInputProps) => {
  return (
    <BaseInput
      {...props}
      type="date"
      icon={<CalendarIcon className="h-[18px] w-[18px] text-primary" />}
      className={clsx(
        '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
        '[&::-webkit-calendar-picker-indicator]:opacity-0',
        className,
      )}
    />
  )
}
