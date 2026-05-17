import { describe, expect, it, vi, beforeEach } from 'vitest'

import { fetchCheckImage } from './fetchCheckImage'

describe('fetchCheckImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает файл с типом application/pdf', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any as any

    const file = await fetchCheckImage()

    expect(file).toBeInstanceOf(File)
    expect(file.type).toBe('application/pdf')
  })

  it('использует переданный checkKey как имя файла', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage('my-check-key')

    expect(file.name).toBe('my-check-key.pdf')
  })

  it('использует stub-check как имя файла по умолчанию', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage()

    expect(file.name).toBe('stub-check.pdf')
  })

  it('использует undefined как null для имени файла', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage(undefined)

    expect(file.name).toBe('stub-check.pdf')
  })

  it('ищет файл по пути /logo.svg', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    await fetchCheckImage()

    expect(global.fetch).toHaveBeenCalledWith('/logo.svg')
  })

  it('выбрасывает ошибку при неудачном ответе', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(fetchCheckImage()).rejects.toThrow('Failed to fetch check image: 404')
  })

  it('выбрасывает ошибку при статусе 500', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(fetchCheckImage()).rejects.toThrow('Failed to fetch check image: 500')
  })

  it('выбрасывает ошибку при статусе 401', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    await expect(fetchCheckImage()).rejects.toThrow('Failed to fetch check image: 401')
  })

  it('обрабатывает сетевую ошибку при fetch', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchCheckImage()).rejects.toThrow('Network error')
  })

  it('обрабатывает ошибку при получении blob', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.reject(new Error('Blob error')),
    })

    await expect(fetchCheckImage()).rejects.toThrow('Blob error')
  })

  it('возвращает файл содержащий данные блоба', async () => {
    const testContent = 'test pdf content'
    const mockBlob = new Blob([testContent], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage()

    expect(file.size).toBeGreaterThan(0)
  })

  it('работает с различными checkKey значениями', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage('check-123-abc')

    expect(file.name).toBe('check-123-abc.pdf')
  })

  it('checkKey с специальными символами', async () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    }) as any

    const file = await fetchCheckImage('check_key-with-dash_123')

    expect(file.name).toBe('check_key-with-dash_123.pdf')
  })
})
