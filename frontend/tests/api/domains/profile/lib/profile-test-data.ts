export function buildUpdateProfilePayload(prefix = 'qa_profile') {
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    first_name: 'QA',
    second_name: 'Profile',
    login: `${prefix}_${stamp}`,
  }
}

export function buildChangePasswordPayload(currentPassword: string, newPassword = 'NewValidPassword123') {
  return {
    current_password: currentPassword,
    new_password: newPassword,
  }
}
