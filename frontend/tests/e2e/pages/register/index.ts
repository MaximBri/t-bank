import { expect, type Page } from '@playwright/test'
import { APP_ROUTES } from '../../shared/routes/index'


export class RegisterPage {
  constructor(private readonly page: Page) {}

  readonly loginInput = this.page.getByLabel('Логин')
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Пароль *', exact: true })
  readonly passwordRepeatInput = this.page.getByRole('textbox', {
    name: 'Повторите пароль *',
    exact: true,
  })
  readonly submitButton = this.page.getByRole('button', { name: 'Зарегистрироваться' })

  async open(): Promise<void> {
    await this.page.goto(APP_ROUTES.REGISTER)
  }

  async register(login: string, password: string): Promise<void> {
    await this.loginInput.fill(login)
    await this.passwordInput.fill(password)
    await this.passwordRepeatInput.fill(password)
    await this.submitButton.click()
  }

  async expectOpened(): Promise<void> {
    await expect(this.page).toHaveURL(APP_ROUTES.REGISTER)
    await expect(this.submitButton).toBeVisible()
  }
}
