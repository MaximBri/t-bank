import { expect, type Page } from '@playwright/test'

export class CreateEventModal {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { name: 'Создание события' })
  readonly submitButton = this.page.getByRole('button', { name: 'Создать' })
  readonly closeButton = this.page.getByRole('button', { name: 'close-create-event-modal' })

  async expectOpened(): Promise<void> {
    await expect(this.heading).toBeVisible()
    await expect(this.submitButton).toBeVisible()
    await expect(this.closeButton).toBeVisible()
  }
}
