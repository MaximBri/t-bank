import { expect, type Page } from '@playwright/test'

export class CreateEventModal {
  constructor(private readonly page: Page) {}

  readonly dialog = this.page.getByRole('dialog')
  readonly heading = this.dialog.getByRole('heading', { name: 'Создание события' })
  readonly submitButton = this.dialog.getByRole('button', { name: 'Создать', exact: true })
  readonly closeButton = this.dialog.getByRole('button', { name: 'close-create-event-modal' })

  async expectOpened(): Promise<void> {
    await expect(this.heading).toBeVisible()
    await expect(this.submitButton).toBeVisible()
    await expect(this.closeButton).toBeVisible()
  }
}
