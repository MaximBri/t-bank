
export type UserData = {
  firstName: string | null,
  lastName: string | null,
  avatarUrl?: string,
}

export type User = UserData & {
  id: string
  login: string
}

export type UserStore = {
  isAuthResolved: boolean
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  clearUser: () => void
  fetchCurrentUser: () => Promise<User | null>
  login: (payload: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (payload: AuthCredentials) => Promise<void>
  setUser: (user: User | null) => void
  update: (data: UserData) => Promise<void>
  changePassword: (data: ChangePasswordDto) => Promise<void>
}

export type AuthCredentials = {
  login: string
  password: string
  inviteToken?: string
}

export type CurrentUserDto = {
  user_id: string
  login: string
  first_name: string | null
  second_name: string | null
  avatar_url: string | null
}

export type ChangePasswordDto = {
  current_password: string,
  new_password: string
}

export type RegisterResponseDto = {
  userId: string
  joinedGroupId: string | null
}

