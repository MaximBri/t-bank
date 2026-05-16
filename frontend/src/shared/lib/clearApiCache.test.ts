import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clearApiCache } from './clearApiCache'

describe('clearApiCache', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns early when caches is undefined', async () => {
    await expect(clearApiCache()).resolves.toBeUndefined()
  })

  it('calls caches.delete with "api-cache"', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('caches', { delete: mockDelete })
    await clearApiCache()
    expect(mockDelete).toHaveBeenCalledWith('api-cache')
  })

  it('handles error from caches.delete without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('caches', { delete: vi.fn().mockRejectedValue(new Error('fail')) })
    await expect(clearApiCache()).resolves.toBeUndefined()
    consoleSpy.mockRestore()
  })
})
