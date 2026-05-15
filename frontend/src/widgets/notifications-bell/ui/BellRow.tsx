import type { ReactNode } from 'react'
import clsx from 'clsx'

type BellRowProps = {
  isHighlighted?: boolean
  children: ReactNode
}

export const BellRow = ({ isHighlighted, children }: BellRowProps) => (
  <div
    className={clsx(
      'flex flex-col gap-[6px] border-b border-primary px-[16px] py-[12px] last:border-b-0',
      isHighlighted ? 'bg-primary/40' : '',
    )}
  >
    {children}
  </div>
)
