export type SignInByCredentialsFormValues = {
    login: string
    password: string
}

export type SignInByCredentialsPayload = {
    login: string
    password: string
}

export type SignInByCredentialsSubmit = (values: SignInByCredentialsPayload) => Promise<void> | void
