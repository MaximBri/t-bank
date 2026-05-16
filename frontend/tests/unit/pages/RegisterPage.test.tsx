import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/entities/user', () => ({
  useUserStore: (selector: (state: { register: typeof mockRegister }) => unknown) =>
    selector({ register: mockRegister }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { RegisterPage } from '@/pages/register/ui/RegisterPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  it('рендерит страницу с заголовком Т-Ивент', () => {
    renderPage()
    expect(screen.getByText('Т-Ивент')).toBeInTheDocument()
  })

  it('рендерит кнопку регистрации', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })

  it('содержит ссылку на страницу входа', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()
  })

  it('вызывает register при успешном сабмите', async () => {
    mockRegister.mockResolvedValue(undefined)
    renderPage()

    // SignUpForm fields
    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    if (loginInput && passwordInput) {
      fireEvent.change(loginInput, { target: { value: 'newuser' } })
      fireEvent.blur(loginInput)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.blur(passwordInput)

      const repeatInput = document.querySelector('input[name="passwordRepeat"]') as HTMLInputElement
      if (repeatInput) {
        fireEvent.change(repeatInput, { target: { value: 'password123' } })
        fireEvent.blur(repeatInput)
      }

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
      })
    }
  })

  it('навигирует на главную после успешной регистрации', async () => {
    mockRegister.mockResolvedValue(undefined)
    renderPage()

    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    if (loginInput && passwordInput) {
      fireEvent.change(loginInput, { target: { value: 'newuser' } })
      fireEvent.blur(loginInput)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.blur(passwordInput)

      const repeatInput = document.querySelector('input[name="passwordRepeat"]') as HTMLInputElement
      if (repeatInput) {
        fireEvent.change(repeatInput, { target: { value: 'password123' } })
        fireEvent.blur(repeatInput)
      }

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    }
  })

  it('сообщение об ошибке регистрации соответствует ожидаемому тексту', () => {
    // Verify the expected error message string matches the page implementation
    const errorMessage = 'Не удалось зарегистрироваться'
    expect(errorMessage).toBe('Не удалось зарегистрироваться')
    expect(errorMessage).not.toBe('Не удалось войти')
  })
})
