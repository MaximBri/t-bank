export type User = {
  id: string
  username: string
}

export type UserStore = {
  isAuthResolved: boolean
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  clearUser: () => void
  fetchCurrentUser: () => Promise<User | null>
  login: (payload: { login: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  register: (payload: { login: string; password: string }) => Promise<void>
  setUser: (user: User | null) => void
}

export type AuthCredentials = {
  login: string
  password: string
}
export type CurrentUserDto = {
  userId: string
  username: string
}
export type RegisterResponseDto = {
  userId: string
  joinedGroupId: string | null
}

