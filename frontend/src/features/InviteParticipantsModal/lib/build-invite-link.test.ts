import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { buildInviteLink } from './build-invite-link'

describe('buildInviteLink', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
    })
  })

  it('builds correct invite link', () => {
    const link = buildInviteLink('event-123', 'token-abc')
    expect(link).toBe('https://example.com/invite/event-123/token-abc')
  })

  it('includes eventId in the path', () => {
    const link = buildInviteLink('my-event', 'some-token')
    expect(link).toContain('/invite/my-event/')
  })

  it('includes token in the path', () => {
    const link = buildInviteLink('my-event', 'unique-token-xyz')
    expect(link).toContain('/unique-token-xyz')
  })

  it('uses window.location.origin as base', () => {
    const link = buildInviteLink('e1', 't1')
    expect(link.startsWith(window.location.origin)).toBe(true)
  })
})
