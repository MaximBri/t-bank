import { describe, expect, it } from 'vitest'
import { getUserInitials } from '@/shared/lib/getUserInitials'

describe('getUserInitials', () => {
  it('возвращает инициалы при наличии firstName и lastName', () => {
    expect(getUserInitials('Иван', 'Петров')).toBe('И.П.')
  })

  it('возвращает только первую букву firstName когда нет lastName', () => {
    expect(getUserInitials('Анна')).toBe('А.')
  })

  it('возвращает только первую букву lastName когда нет firstName', () => {
    expect(getUserInitials(undefined, 'Сидоров')).toBe('С.')
  })

  it('возвращает первую букву login когда нет firstName и lastName', () => {
    expect(getUserInitials(undefined, undefined, 'user123')).toBe('U')
  })

  it('возвращает пустую строку когда всё пустое', () => {
    expect(getUserInitials()).toBe('')
  })

  it('возвращает пустую строку когда переданы null', () => {
    expect(getUserInitials(null, null, null)).toBe('')
  })

  it('игнорирует login если есть firstName', () => {
    expect(getUserInitials('Максим', undefined, 'login')).toBe('М.')
  })

  it('возвращает инициалы в верхнем регистре', () => {
    expect(getUserInitials('anna', 'иванова')).toBe('A.И.')
  })

  it('первая буква login в верхнем регистре', () => {
    expect(getUserInitials(undefined, undefined, 'admin')).toBe('A')
  })

  it('возвращает пустую строку при пустых строках firstName и lastName и пустом login', () => {
    expect(getUserInitials('', '', '')).toBe('')
  })

  it('возвращает только lastName инициал при пустом firstName', () => {
    expect(getUserInitials('', 'Козлов')).toBe('К.')
  })
})
