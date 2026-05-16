import { expect, type Page } from '@playwright/test'

import { APP_ROUTES } from '../../shared/routes/index'

export class HomePage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { name: 'Мои события' })
  readonly createEventButton = this.page.getByRole('button', { name: 'Создать событие' })

  async expectOpened(): Promise<void> {
    await expect(this.page).toHaveURL(APP_ROUTES.HOME)
    await expect(this.heading).toBeVisible()
  }

  async open(): Promise<void> {
    await this.page.goto(APP_ROUTES.HOME)
  }

  async openCreateEventModal(): Promise<void> {
    await this.createEventButton.click()
  }

  async openEvent(title: string): Promise<void> {
    await this.page.getByRole('link', { name: `Открыть событие ${title}`, exact: true }).click()
  }
}
