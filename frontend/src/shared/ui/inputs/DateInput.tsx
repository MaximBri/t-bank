import clsx from 'clsx'
import CalendarIcon from '@/shared/assets/icons/calendar.svg?react'
import { BaseInput, BaseInputProps } from './BaseInput.tsx'

type DateInputProps = Omit<BaseInputProps, 'type'> & {
  calendarIconSize?: number | string
}

export const DateInput = ({ className, calendarIconSize = 18, ...props }: DateInputProps) => {
  return (
    <BaseInput
      {...props}
      type="date"
      icon={
        <CalendarIcon width={calendarIconSize} height={calendarIconSize} className="text-primary" />
      }
      className={clsx(
        '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
        '[&::-webkit-calendar-picker-indicator]:opacity-0',
        className,
      )}
    />
  )
}
