import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clearApiCache } from './clearApiCache'

describe('clearApiCache', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('досрочно завершается когда caches не определён', async () => {
    await expect(clearApiCache()).resolves.toBeUndefined()
  })

  it('вызывает caches.delete с аргументом "api-cache"', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('caches', { delete: mockDelete })
    await clearApiCache()
    expect(mockDelete).toHaveBeenCalledWith('api-cache')
  })

  it('обрабатывает ошибку от caches.delete без выброса исключения', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('caches', { delete: vi.fn().mockRejectedValue(new Error('fail')) })
    await expect(clearApiCache()).resolves.toBeUndefined()
    consoleSpy.mockRestore()
  })
})
