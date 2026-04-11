export type SignUpByCredentialsFormValues = {
  login: string
  password: string
  passwordRepeat: string
}

export type SignUpByCredentialsPayload = {
  login: string
  password: string
}

export type SignUpByCredentialsSubmit = (values: SignUpByCredentialsPayload) => Promise<void> | void
