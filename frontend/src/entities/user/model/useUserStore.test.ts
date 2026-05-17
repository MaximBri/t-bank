import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserStore } from './useUserStore'

vi.mock('@/entities/user', () => ({
  userApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    getErrorInfo: vi.fn(() => ({ message: 'Error', status: 500 })),
  },
}))

vi.mock('@/shared/lib/clearApiCache', () => ({
  clearApiCache: vi.fn().mockResolvedValue(undefined),
}))

const mockUser = {
  id: 'user-1',
  login: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
}

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isAuthResolved: false,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('начальное состояние: user=null, isAuthenticated=false', () => {
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setUser устанавливает пользователя и isAuthenticated=true', () => {
    useUserStore.getState().setUser(mockUser)
    const state = useUserStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isAuthResolved).toBe(true)
  })

  it('setUser(null) устанавливает isAuthenticated=false', () => {
    useUserStore.getState().setUser(mockUser)
    useUserStore.getState().setUser(null)
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('clearUser сбрасывает всё', () => {
    useUserStore.getState().setUser(mockUser)
    useUserStore.getState().clearUser()
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.isAuthResolved).toBe(true)
  })

  it('login выбрасывает ошибку при неудачном запросе', async () => {
    const { userApi } = await import('@/entities/user')
    vi.mocked(userApi.login).mockRejectedValueOnce(new Error('401'))
    vi.mocked(userApi.getErrorInfo).mockReturnValueOnce({ message: 'Неверные данные', status: 401 })

    await expect(
      useUserStore.getState().login({ login: 'bad', password: 'bad' }),
    ).rejects.toThrow('Неверные данные')

    expect(useUserStore.getState().isLoading).toBe(false)
  })

  it('login устанавливает пользователя при успехе', async () => {
    const { userApi } = await import('@/entities/user')
    vi.mocked(userApi.login).mockResolvedValueOnce(undefined)
    vi.mocked(userApi.me).mockResolvedValueOnce({
      user_id: 'user-1',
      login: 'testuser',
      first_name: 'Test',
      second_name: 'User',
      avatar_url: null,
    })

    await useUserStore.getState().login({ login: 'testuser', password: 'pass' })

    const state = useUserStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.login).toBe('testuser')
  })
})
