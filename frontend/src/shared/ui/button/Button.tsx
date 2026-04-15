import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import clsx from 'clsx'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
  }
>

export const Button = ({
  children,
  className,
  disabled = false,
  isLoading = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center disabled:cursor-not-allowed',
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

      <span className={clsx(isLoading && 'invisible')}>{children}</span>
    </button>
  )
}
