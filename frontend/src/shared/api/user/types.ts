export type AuthCredentials = {
  login: string
  password: string
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

export type ApiErrorDto = {
  message: string
  status: number
}
