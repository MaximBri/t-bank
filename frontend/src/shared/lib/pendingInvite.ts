const STORAGE_KEY = 'pending_invite_token'

export const pendingInvite = {
  set: (token: string) => sessionStorage.setItem(STORAGE_KEY, token),
  get: () => sessionStorage.getItem(STORAGE_KEY) ?? undefined,
  clear: () => sessionStorage.removeItem(STORAGE_KEY),
}
