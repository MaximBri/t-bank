import { expect, type Page } from '@playwright/test'

export class LeaveEventModal {
  constructor(private readonly page: Page) {}

  readonly closeButton = this.page.getByRole('button', { name: 'close-leave-event-modal' })

  async expectOpened(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: /вы уверены что хотите покинуть событие|пока нельзя выйти/i,
      }),
    ).toBeVisible()
    await expect(this.closeButton).toBeVisible()
  }

  async expectPrimaryActionVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /покинуть|к взаиморасчётам/i }),
    ).toBeVisible()
  }
}
