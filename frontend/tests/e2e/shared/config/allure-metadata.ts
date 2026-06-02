import { createRequire } from 'node:module'

import type { TestInfo } from '@playwright/test'

const require = createRequire(import.meta.url)

type AllureApi = {
  parameter: (name: string, value: string) => Promise<void>
}

const loadAllure = (): AllureApi | null => {
  try {
    return require('allure-js-commons') as AllureApi
  } catch {
    return null
  }
}

export async function addE2eEnvironmentMetadata(
  browserName: string,
  testInfo: TestInfo,
): Promise<void> {
  const allure = loadAllure()
  if (!allure) return

  await allure.parameter('browser', browserName)
  await allure.parameter('project', testInfo.project.name)
}
