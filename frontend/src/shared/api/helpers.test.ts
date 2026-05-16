import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { getErrorInfo } from './helpers'

describe('getErrorInfo', () => {
  it('extracts message and status from AxiosError with response', () => {
    const error = new axios.AxiosError('Request failed', '400', undefined, undefined, {
      status: 400,
      data: { message: 'Bad Request' },
    } as any)
    const result = getErrorInfo(error)
    expect(result.message).toBe('Bad Request')
    expect(result.status).toBe(400)
  })

  it('uses axios message when response data has no message', () => {
    const error = new axios.AxiosError('Network Error', 'ERR_NETWORK')
    const result = getErrorInfo(error)
    expect(result.message).toBe('Network Error')
    expect(result.status).toBeUndefined()
  })

  it('extracts message from standard Error', () => {
    const result = getErrorInfo(new Error('something broke'))
    expect(result.message).toBe('something broke')
    expect(result.status).toBeUndefined()
  })

  it('uses fallback message for unknown error type', () => {
    const result = getErrorInfo('unexpected string error')
    expect(result.message).toBe('Не удалось выполнить запрос')
    expect(result.status).toBeUndefined()
  })

  it('uses fallback message for null', () => {
    const result = getErrorInfo(null)
    expect(result.message).toBe('Не удалось выполнить запрос')
  })
})
