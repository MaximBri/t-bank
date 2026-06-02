import clsx from 'clsx'
import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Хлебные крошки"
      className={clsx('min-w-0 text-muted', className)}
    >
      <ol className="flex min-w-0 items-center gap-[8px] overflow-hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li
              key={`${item.label}-${index}`}
              className={clsx(
                'flex min-w-0 items-center gap-[8px]',
                isLast ? 'flex-1' : 'shrink-0',
              )}
            >
              {index > 0 ? (
                <span className="shrink-0 text-muted" aria-hidden="true">
                  /
                </span>
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-body text-muted transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={clsx(
                    'truncate text-body',
                    isLast ? 'text-primary' : 'text-muted',
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
