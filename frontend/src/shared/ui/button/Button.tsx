import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import clsx from 'clsx'
import { ButtonEnum } from './constants'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    variant?: ButtonEnum
  }
>

export const Button = ({
  children,
  className,
  disabled = false,
  isLoading = false,
  variant = ButtonEnum.Primary,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'items-center justify-center disabled:cursor-not-allowed rounded-[10px] sm:rounded-md border-[2px] px-3 py-[6px] sm:px-[22px] sm:py-[14px] text-body flex flex-row gap-[10px] max-h-[30px] sm:max-h-[47px]',
        variant === ButtonEnum.Primary && 'border-yellow bg-yellow text-primary',
        variant === ButtonEnum.Secondary && 'border-primary bg-primary text-primary',
        variant === ButtonEnum.Tertialy && 'border-error bg-error text-secondary',
        variant === ButtonEnum.Empty && 'border-transparent',
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span
          className="absolute inline-block h-[18px] w-[18px] animate-spin rounded-full border-[3px] border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      <span className={clsx('contents', isLoading && 'invisible')}>{children}</span>
    </button>
  )
}
