import clsx from 'clsx'
import type { ElementType } from 'react'
import { TextProps } from './types'
import { variantClasses } from './constants'

export const Text = <T extends ElementType = 'p'>({
  as,
  variant = 'body',
  children,
  className,
}: TextProps<T>) => {
  const Component = as || 'p'

  return <Component className={clsx(variantClasses[variant], className, '')}>{children}</Component>
}
