import { z } from 'zod'
import { parseNumberValue } from '@/shared/lib/number/parse-number.ts'

export const requiredString = (message = 'Поле обязательно') =>z.string({
    required_error: message,
    invalid_type_error: message,
}).min(1, message)

export const emailSchema = (message = 'Введите корректный email') => requiredString().email(message)

export const numberFromInput = (message = 'Введите число') =>
  z.preprocess(
    (value) => {
      const parsedValue = parseNumberValue(value)
      return parsedValue ?? value
    },
    z.number({
      invalid_type_error: message,
      required_error: message,
    }),
  )

export const optionalNumberFromInput = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }

    if (typeof value === 'string') {
      return Number(value)
    }

    return value
  }, z.number().optional())

export const createFormSchema = <TShape extends z.ZodRawShape>(shape: TShape) => {
  return z.object(shape)
}

export type InferFormValues<TSchema extends z.ZodTypeAny> = z.infer<TSchema>
