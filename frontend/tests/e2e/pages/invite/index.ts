import { expect, type Page } from '@playwright/test'

import { buildInviteRoute } from '../../shared/routes/index'

export class InvitePage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { name: 'Приглашение в событие' })
  readonly loginButton = this.page.getByRole('button', { name: 'Войти' })
  readonly registerButton = this.page.getByRole('button', { name: 'Зарегистрироваться' })
  readonly declineButton = this.page.getByRole('button', { name: 'Отклонить' })
  readonly closeButton = this.page.getByRole('button', { name: 'close-invite-page' })

  async open(eventId: string, token: string): Promise<void> {
    await this.page.goto(buildInviteRoute(eventId, token))
  }

  async expectOpened(): Promise<void> {
    await expect(this.heading).toBeVisible()
    await expect(this.loginButton).toBeVisible()
    await expect(this.declineButton).toBeVisible()
    await expect(this.closeButton).toBeVisible()
  }

  async expectRegistrationActionAvailable(): Promise<void> {
    await expect(this.registerButton).toBeVisible()
  }
}
