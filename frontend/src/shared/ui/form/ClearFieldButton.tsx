import type { FC } from 'react'

type clearButtonProps = {
  hasValue: boolean
  onClear: () => void
  disabled?: boolean
}

export const ClearFieldButton: FC<clearButtonProps> = ({ hasValue, onClear, disabled }) => {
  return hasValue ? (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled}
      aria-label="Clear field"
      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-sm leading-none text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      x
    </button>
  ) : null
}
