import { expect, type Page } from '@playwright/test'

import { APP_ROUTES } from '../../shared/routes/index'

export class ProfilePage {
  constructor(private readonly page: Page) {}

  readonly headerProfileLink = this.page.getByRole('link', { name: 'Перейти в профиль' })
  readonly profileNav = this.page.getByRole('navigation')
  readonly profileNavButton = this.profileNav.getByRole('button', { name: 'Профиль', exact: true })
  readonly securityNavButton = this.profileNav.getByRole('button', {
    name: 'Безопасность',
    exact: true,
  })
  readonly editProfileButton = this.page.getByRole('button', { name: 'Редактировать профиль' })
  readonly logoutButton = this.page.getByRole('button', { name: 'Выйти' })

  async open(): Promise<void> {
    await this.page.goto(`${APP_ROUTES.PROFILE}?section=profile`, { waitUntil: 'domcontentloaded' })
  }

  async openFromHeader(): Promise<void> {
    await this.headerProfileLink.click()
  }

  async expectOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/profile(\?section=profile)?$/)
    await expect(this.profileNavButton).toBeVisible()
    await expect(this.securityNavButton).toBeVisible()
    await expect(this.editProfileButton).toBeVisible()
    await expect(this.logoutButton).toBeVisible()
  }
}
