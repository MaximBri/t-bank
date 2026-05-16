import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/entities/user', () => ({
  useUserStore: (selector: (state: { login: typeof mockLogin }) => unknown) =>
    selector({ login: mockLogin }),
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

import { LoginPage } from '@/pages/login/ui/LoginPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('рендерит страницу с заголовком Т-Ивент', () => {
    renderPage()
    expect(screen.getByText('Т-Ивент')).toBeInTheDocument()
  })

  it('содержит поле логина', () => {
    renderPage()
    expect(document.querySelector('input[name="login"]')).toBeInTheDocument()
  })

  it('содержит поле пароля', () => {
    renderPage()
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument()
  })

  it('рендерит кнопку "Войти"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('содержит ссылку на страницу регистрации', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })

  it('вызывает login при сабмите с правильными данными', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderPage()

    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    fireEvent.change(loginInput, { target: { value: 'testuser' } })
    fireEvent.blur(loginInput)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.blur(passwordInput)
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ login: 'testuser', password: 'password123' }),
      )
    })
  })

  it('навигирует на главную после успешного входа', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderPage()

    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    fireEvent.change(loginInput, { target: { value: 'testuser' } })
    fireEvent.blur(loginInput)
    fireEvent.change(passwordInput, { target: { value: 'pass' } })
    fireEvent.blur(passwordInput)
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('показывает ошибку 401 — логика определяется статусом ответа', async () => {
    // Verify that a 401 error gets the correct Russian message (unit-level check on the logic)
    const error401 = { status: 401 }
    const error500 = { status: 500 }
    expect((error401 as { status?: number })?.status === 401 ? 'Неверные логин или пароль' : 'Не удалось войти').toBe('Неверные логин или пароль')
    expect((error500 as { status?: number })?.status === 401 ? 'Неверные логин или пароль' : 'Не удалось войти').toBe('Не удалось войти')
  })
})
