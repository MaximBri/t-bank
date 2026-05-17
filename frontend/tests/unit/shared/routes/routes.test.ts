import { describe, expect, it } from 'vitest'
import { APP_ROUTES, buildEventRoute } from '@/shared/routes'

describe('APP_ROUTES', () => {
  it('HOME равен "/"', () => {
    expect(APP_ROUTES.HOME).toBe('/')
  })

  it('LOGIN равен "/login"', () => {
    expect(APP_ROUTES.LOGIN).toBe('/login')
  })

  it('REGISTER равен "/register"', () => {
    expect(APP_ROUTES.REGISTER).toBe('/register')
  })

  it('EVENT содержит параметр eventId', () => {
    expect(APP_ROUTES.EVENT).toBe('/events/:eventId')
  })

  it('INVITE содержит параметры eventId и token', () => {
    expect(APP_ROUTES.INVITE).toBe('/invite/:eventId/:token')
  })

  it('PROFILE равен "/profile"', () => {
    expect(APP_ROUTES.PROFILE).toBe('/profile')
  })

  it('NOT_FOUND равен "*"', () => {
    expect(APP_ROUTES.NOT_FOUND).toBe('*')
  })

  it('все значения являются строками', () => {
    Object.values(APP_ROUTES).forEach((route) => {
      expect(typeof route).toBe('string')
    })
  })

  it('все значения начинаются с "/" или равны "*"', () => {
    Object.values(APP_ROUTES).forEach((route) => {
      expect(route === '*' || route.startsWith('/')).toBe(true)
    })
  })
})

describe('buildEventRoute', () => {
  it('формирует маршрут с числовым id', () => {
    expect(buildEventRoute('123')).toBe('/events/123')
  })

  it('формирует маршрут со строковым id', () => {
    expect(buildEventRoute('abc-def')).toBe('/events/abc-def')
  })

  it('формирует маршрут с uuid', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(buildEventRoute(uuid)).toBe(`/events/${uuid}`)
  })

  it('начинается с /events/', () => {
    expect(buildEventRoute('any-id')).toMatch(/^\/events\//)
  })

  it('не содержит параметры с двоеточием после подстановки', () => {
    expect(buildEventRoute('42')).not.toContain(':')
  })
})
