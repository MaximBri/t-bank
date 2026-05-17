export type User = {
  id: string
  login: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  avatarPreviewUrl: string | null
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
  updateProfile: (payload: UpdateProfileInput) => Promise<User>
}

export type UpdateProfileInput = {
  firstName?: string
  lastName?: string
  login?: string
  avatar?: File | null
}

export type UpdateProfileDto = {
  first_name?: string
  second_name?: string
  avatar_url?: string
  login?: string
}

export type UserProfileDto = {
  id: string
  login: string
  first_name: string | null
  second_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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
export type RegisterResponseDto = {
  userId: string
  joinedGroupId: string | null
}

