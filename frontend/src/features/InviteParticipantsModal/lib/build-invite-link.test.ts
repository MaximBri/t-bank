import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { buildInviteLink } from './build-invite-link'

describe('buildInviteLink', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { origin: 'https://example.com' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('формирует ссылку с eventId и token', () => {
    const result = buildInviteLink('event-123', 'token-abc')
    expect(result).toBe('https://example.com/invite/event-123/token-abc')
  })

  it('включает origin в ссылку', () => {
    const result = buildInviteLink('ev1', 'tok1')
    expect(result).toContain('https://example.com')
  })
})
