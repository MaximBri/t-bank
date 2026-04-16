import clsx from 'clsx'
import { type PropsWithChildren, useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = PropsWithChildren<{
  className?: string
  isOpen: boolean
  onClose: () => void
}>

export const Modal = ({ children, className, isOpen, onClose }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-modal/45 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={clsx(
          'bg-secondary shadow-[0_24px_60px_rgba(0,0,0,0.18)]',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
