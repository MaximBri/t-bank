import clsx from 'clsx'
import { type InputHTMLAttributes, type ReactNode } from 'react'

export type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode
  iconClassName?: string
  iconPosition?: 'left' | 'right'
  name?: string
}

export const BaseInput = ({
  className,
  icon,
  iconClassName,
  iconPosition = 'right',
  type = 'text',
  ...props
}: BaseInputProps) => {
  return (
    <span className="relative block">
      <input
        {...props}
        type={type}
        className={clsx(
          'w-full rounded-md border text-primary placeholder:text-placeholder',
          className,
        )}
      />

      {icon ? (
        <span
          className={clsx(
            'pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center',
            iconPosition === 'left' ? 'left-4' : 'right-4',
            iconClassName,
          )}
        >
          {icon}
        </span>
      ) : null}
    </span>
  )
}
