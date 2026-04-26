import { isAxiosError } from "axios"
import { ApiErrorDto } from "./types"

export const getErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiErrorDto>(error)) {
    return error.response?.data?.message ?? error.message
  }

  return error instanceof Error ? error.message : 'Не удалось выполнить запрос'
}