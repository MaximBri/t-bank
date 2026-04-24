import { ElementType, ReactNode } from 'react'

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption'

export type TextProps<T extends ElementType = 'p'> = {
  as?: T
  variant?: TextVariant
  children: ReactNode
  className?: string
}
