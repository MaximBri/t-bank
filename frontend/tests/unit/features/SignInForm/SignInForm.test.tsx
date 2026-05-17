import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SignInForm } from '@/features/SignInForm/ui/SignInForm'

function renderForm(onSubmit = vi.fn()) {
  return render(
    <MemoryRouter>
      <SignInForm onSubmit={onSubmit} />
    </MemoryRouter>,
  )
}

describe('SignInForm', () => {
  it('рендерит кнопку "Войти"', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('рендерит поля логина и пароля', () => {
    renderForm()
    expect(document.querySelector('input[name="login"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument()
  })

  it('показывает ошибки валидации при пустом сабмите', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => {
      expect(screen.getByText('Введите логин')).toBeInTheDocument()
      expect(screen.getByText('Введите пароль')).toBeInTheDocument()
    })
  })

  it('вызывает onSubmit с правильными данными', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(onSubmit)

    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    fireEvent.change(loginInput, { target: { value: 'testuser' } })
    fireEvent.blur(loginInput)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.blur(passwordInput)
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ login: 'testuser', password: 'password123' })
    })
  })

  it('содержит ссылку на страницу регистрации', () => {
    renderForm()
    expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })

  it('сбрасывает форму после успешного сабмита', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(onSubmit)

    const loginInput = document.querySelector('input[name="login"]') as HTMLInputElement
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement

    fireEvent.change(loginInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(loginInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })
  })
})
