import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { defaultExpenseCategories } from '../model/constants'
import { useExpenseCategories } from './use-expense-categories'
import type { ExpenseCategoryList } from '../model/types'

type TestFormValues = {
  categories: ExpenseCategoryList
}

/**
 * Helper: spin up a useForm + useExpenseCategories pair so we can
 * exercise all the hook's logic.
 */
function setupHook(initialCategories: ExpenseCategoryList = [...defaultExpenseCategories]) {
  return renderHook(() => {
    const { control, getValues, setError, setValue, clearErrors } = useForm<TestFormValues>({
      defaultValues: { categories: initialCategories },
    })

    const expenseCategories = useExpenseCategories<TestFormValues>({
      control,
      getValues,
      setError,
      setValue,
      clearErrors,
    })

    return { ...expenseCategories, getValues }
  })
}

describe('useExpenseCategories', () => {
  describe('начальное состояние', () => {
    it('возвращает дефолтные категории', () => {
      const { result } = setupHook()
      expect(result.current.categories).toEqual(defaultExpenseCategories)
    })

    it('categoryInput изначально пустой', () => {
      const { result } = setupHook()
      expect(result.current.categoryInput).toBe('')
    })
  })

  describe('setCategoryInput', () => {
    it('обновляет categoryInput', () => {
      const { result } = setupHook()

      act(() => {
        result.current.setCategoryInput('Новая')
      })

      expect(result.current.categoryInput).toBe('Новая')
    })
  })

  describe('addCategory', () => {
    it('добавляет новую категорию', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.setCategoryInput('Спорт')
      })
      act(() => {
        result.current.addCategory()
      })

      expect(result.current.getValues('categories')).toContain('Спорт')
    })

    it('сбрасывает categoryInput после добавления', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.setCategoryInput('Спорт')
      })
      act(() => {
        result.current.addCategory()
      })

      expect(result.current.categoryInput).toBe('')
    })

    it('не добавляет пустую строку', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.setCategoryInput('   ')
      })
      act(() => {
        result.current.addCategory()
      })

      expect(result.current.getValues('categories')).toHaveLength(0)
    })

    it('не добавляет пустой ввод без изменений', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.addCategory()
      })

      expect(result.current.getValues('categories')).toHaveLength(0)
    })

    it('обрезает пробелы перед добавлением', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.setCategoryInput('  Кино  ')
      })
      act(() => {
        result.current.addCategory()
      })

      expect(result.current.getValues('categories')).toContain('Кино')
    })

    it('не добавляет дублирующую категорию', () => {
      const { result } = setupHook(['Питание'])

      act(() => {
        result.current.setCategoryInput('Питание')
      })
      act(() => {
        result.current.addCategory()
      })

      // still only one entry
      const cats = result.current.getValues('categories')
      expect(cats.filter((c) => c === 'Питание')).toHaveLength(1)
    })
  })

  describe('removeCategory', () => {
    it('удаляет категорию из списка', () => {
      const { result } = setupHook(['Транспорт', 'Питание', 'Развлечения'])

      act(() => {
        result.current.removeCategory('Питание')
      })

      const cats = result.current.getValues('categories')
      expect(cats).not.toContain('Питание')
      expect(cats).toContain('Транспорт')
      expect(cats).toContain('Развлечения')
    })

    it('не изменяет список если категория не найдена', () => {
      const { result } = setupHook(['Транспорт'])

      act(() => {
        result.current.removeCategory('НесуществующаяКатегория')
      })

      expect(result.current.getValues('categories')).toEqual(['Транспорт'])
    })
  })

  describe('resetCategories', () => {
    it('сбрасывает categoryInput', () => {
      const { result } = setupHook()

      act(() => {
        result.current.setCategoryInput('ВременнаяКатегория')
      })
      act(() => {
        result.current.resetCategories()
      })

      expect(result.current.categoryInput).toBe('')
    })
  })

  describe('полный сценарий', () => {
    it('добавляет и удаляет категорию', () => {
      const { result } = setupHook([])

      act(() => {
        result.current.setCategoryInput('Шопинг')
      })
      act(() => {
        result.current.addCategory()
      })

      expect(result.current.getValues('categories')).toContain('Шопинг')

      act(() => {
        result.current.removeCategory('Шопинг')
      })

      expect(result.current.getValues('categories')).not.toContain('Шопинг')
    })
  })
})
