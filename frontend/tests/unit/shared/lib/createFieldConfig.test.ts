import { describe, expect, it } from 'vitest'
import {
  createFieldConfig,
  createTextField,
  createNumberField,
  createSelectField,
  createFields,
  withRequired,
} from '@/shared/lib/forms/createFieldConfig'

describe('createFieldConfig', () => {
  it('возвращает конфиг без изменений', () => {
    const config = { name: 'email', type: 'text' as const, label: 'Email' }
    expect(createFieldConfig(config)).toBe(config)
  })
})

describe('createTextField', () => {
  it('возвращает текстовый конфиг без изменений', () => {
    const config = { name: 'username', type: 'text' as const, label: 'Имя пользователя' }
    expect(createTextField(config)).toBe(config)
  })

  it('сохраняет все поля конфига', () => {
    const config = {
      name: 'username',
      type: 'text' as const,
      label: 'Имя',
      placeholder: 'Введите имя',
      required: true,
    }
    expect(createTextField(config)).toEqual(config)
  })
})

describe('createNumberField', () => {
  it('возвращает числовой конфиг без изменений', () => {
    const config = { name: 'age', type: 'number' as const, label: 'Возраст' }
    expect(createNumberField(config)).toBe(config)
  })
})

describe('createSelectField', () => {
  it('возвращает конфиг выбора без изменений', () => {
    const config = { name: 'role', type: 'select' as const, label: 'Роль' }
    expect(createSelectField(config)).toBe(config)
  })
})

describe('createFields', () => {
  it('возвращает массив конфигов без изменений', () => {
    const configs = [
      { name: 'email', type: 'text' as const, label: 'Email' },
      { name: 'age', type: 'number' as const, label: 'Возраст' },
    ]
    expect(createFields(configs)).toBe(configs)
  })

  it('возвращает пустой массив', () => {
    expect(createFields([])).toEqual([])
  })
})

describe('withRequired', () => {
  it('добавляет required: true к конфигу', () => {
    const config = { name: 'email', type: 'text' as const, label: 'Email' }
    const result = withRequired(config)
    expect(result.required).toBe(true)
  })

  it('не мутирует оригинальный конфиг', () => {
    const config = { name: 'email', type: 'text' as const, label: 'Email' }
    withRequired(config)
    expect((config as typeof config & { required?: boolean }).required).toBeUndefined()
  })

  it('сохраняет все существующие поля', () => {
    const config = {
      name: 'email',
      type: 'text' as const,
      label: 'Email',
      placeholder: 'Введите email',
      disabled: false,
    }
    const result = withRequired(config)
    expect(result).toMatchObject(config)
    expect(result.required).toBe(true)
  })

  it('перезаписывает required: false на required: true', () => {
    const config = { name: 'field', type: 'text' as const, label: 'Поле', required: false }
    expect(withRequired(config).required).toBe(true)
  })
})
