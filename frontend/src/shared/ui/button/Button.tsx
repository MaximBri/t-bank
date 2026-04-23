import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import clsx from 'clsx'
import { ButtonEnum } from './constants'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    withoutAnimation?: boolean
    variant?: ButtonEnum
  }
>

export const Button = ({
  children,
  className,
  disabled = false,
  isLoading = false,
  withoutAnimation = false,
  variant = ButtonEnum.Primary,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'items-center justify-center disabled:cursor-not-allowed rounded-[10px] sm:rounded-md px-3 py-[6px] sm:px-[22px] sm:py-[14px] text-body flex flex-row gap-[10px] max-h-[30px] sm:max-h-[47px]',
        variant === ButtonEnum.Primary && 'border-[2px] border-yellow bg-yellow text-primary',
        variant === ButtonEnum.Secondary && 'border-[2px] border-primary bg-primary text-primary',
        variant === ButtonEnum.Tertialy && 'border-[2px] border-error bg-error text-secondary',
        variant === ButtonEnum.Empty && '',
        !withoutAnimation && 'transition-all duration-200 ease-out [@media(hover:hover)]:hover:scale-[1.02]',
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
