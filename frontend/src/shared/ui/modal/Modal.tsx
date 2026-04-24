import clsx from 'clsx'
import { type PropsWithChildren, useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = PropsWithChildren<{
  className?: string
  isOpen: boolean
  onClose: () => void
}>

export const Modal = ({ children, className, isOpen, onClose }: ModalProps) => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-modal/45 px-[20px] py-[20px] backdrop-blur-sm sm:items-center sm:px-0 sm:py-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={clsx('my-auto', className)}>{children}</div>
    </div>,
    document.body,
  )
}
