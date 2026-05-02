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

export type ApiErrorDto = {
  message: string
  status: number
}
