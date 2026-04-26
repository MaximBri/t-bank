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
