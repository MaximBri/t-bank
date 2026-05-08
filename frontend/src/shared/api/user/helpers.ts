import { isAxiosError } from "axios"
import { ApiErrorDto } from "./types"

export const getErrorInfo = (error: unknown): { message: string; status?: number } => {
  if (isAxiosError<ApiErrorDto>(error)) {
    return {
      message: error.response?.data?.message ?? error.message,
      status: error.response?.status,
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Не удалось выполнить запрос',
  }
}