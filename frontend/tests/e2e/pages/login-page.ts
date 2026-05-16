import { expect, type Page } from '@playwright/test'

import { APP_ROUTES } from '../shared/routes'

export class LoginPage {
  constructor(private readonly page: Page) {}

  readonly loginInput = this.page.getByLabel('Логин')
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Пароль *', exact: true })
  readonly submitButton = this.page.getByRole('button', { name: 'Войти' })

  async open(): Promise<void> {
    await this.page.goto(APP_ROUTES.LOGIN)
  }

  async fillLogin(login: string): Promise<void> {
    await this.loginInput.fill(login)
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async login(login: string, password: string): Promise<void> {
    await this.fillLogin(login)
    await this.fillPassword(password)
    await this.submit()
  }

  async expectOpened(): Promise<void> {
    await expect(this.page).toHaveURL(APP_ROUTES.LOGIN)
    await expect(this.submitButton).toBeVisible()
  }
}
