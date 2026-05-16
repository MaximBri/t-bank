import { expect, type Page } from '@playwright/test'

import { buildEventRoute } from '../../shared/routes/index'

export class EventPage {
  constructor(private readonly page: Page) {}

  readonly leaveEventButton = this.page.getByRole('button', { name: 'Покинуть событие' })

  async open(eventId: string): Promise<void> {
    await this.page.goto(buildEventRoute(eventId), { waitUntil: 'domcontentloaded' })
  }

  async expectOpened(title: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/events\/[^/?]+(\?section=[^#]+)?$/)
    await expect(this.page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  }

  async openLeaveEventModal(): Promise<void> {
    await this.leaveEventButton.click()
  }
}
