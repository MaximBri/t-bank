import clsx from 'clsx'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export const Toggle = ({
  checked,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-yellow' : 'bg-toggle',
        className,
      )}
    >
      <span
        className={clsx(
          'inline-block h-[18px] w-[18px] rounded-full bg-secondary shadow transition-transform duration-200',
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}
