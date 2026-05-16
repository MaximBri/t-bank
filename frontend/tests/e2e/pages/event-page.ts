import { expect, type Page } from '@playwright/test'

import { buildEventRoute } from '../shared/routes'

export class EventPage {
  constructor(private readonly page: Page) {}

  readonly leaveEventButton = this.page.getByRole('button', { name: 'Покинуть событие' })
  readonly sectionsNav = this.page.getByRole('navigation')

  async open(eventId: string): Promise<void> {
    await this.page.goto(buildEventRoute(eventId))
  }

  async expectOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/events\/[^/]+$/)
    await expect(this.sectionsNav).toBeVisible()
  }

  async openLeaveEventModal(): Promise<void> {
    await this.leaveEventButton.click()
  }
}
