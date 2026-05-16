import type { TestInfo } from '@playwright/test'
import * as allure from 'allure-js-commons'

export async function addE2eEnvironmentMetadata(browserName: string, testInfo: TestInfo): Promise<void> {
  await allure.parameter('browser', browserName)
  await allure.parameter('project', testInfo.project.name)
}
