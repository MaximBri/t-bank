import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '@/shared/ui/modal/Modal'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Modal', () => {
  it('не рендерит содержимое когда isOpen=false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Содержимое</div>
      </Modal>,
    )
    expect(screen.queryByText('Содержимое')).not.toBeInTheDocument()
  })

  it('рендерит содержимое когда isOpen=true', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Содержимое модала</div>
      </Modal>,
    )
    expect(screen.getByText('Содержимое модала')).toBeInTheDocument()
  })

  it('имеет role=dialog', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('имеет aria-modal=true', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('вызывает onClose при нажатии Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('не вызывает onClose при нажатии других клавиш', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('вызывает onClose при клике по оверлею', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )
    const overlay = screen.getByRole('dialog')
    fireEvent.mouseDown(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('не вызывает onClose при клике на контент модала', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <div data-testid="modal-content">Контент</div>
      </Modal>,
    )
    const content = screen.getByTestId('modal-content')
    fireEvent.mouseDown(content)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('скрывает содержимое при isOpen=false', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    expect(screen.getByText('Контент')).toBeInTheDocument()

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    expect(screen.queryByText('Контент')).not.toBeInTheDocument()
  })

  it('устанавливает overflow=hidden на body при открытии', () => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = ''

    render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')

    document.body.style.overflow = originalOverflow
  })

  it('восстанавливает overflow на body при закрытии', () => {
    document.body.style.overflow = 'auto'

    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()}>
        <div>Контент</div>
      </Modal>,
    )
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('применяет className к контенту модала', () => {
    render(
      <Modal isOpen onClose={vi.fn()} className="custom-modal-class">
        <div>Контент</div>
      </Modal>,
    )
    const content = screen.getByText('Контент')
    expect(content.parentElement).toHaveClass('custom-modal-class')
  })

  it('рендерит модал в document.body (портал)', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <div data-testid="modal-portal-content">Контент</div>
      </Modal>,
    )
    const modalContent = screen.getByTestId('modal-portal-content')
    expect(document.body.contains(modalContent)).toBe(true)
  })

  it('удаляет слушатель keydown при размонтировании', () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <Modal isOpen onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )

    unmount()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('удаляет слушатель keydown при isOpen=false', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )

    rerender(
      <Modal isOpen={false} onClose={onClose}>
        <div>Контент</div>
      </Modal>,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
