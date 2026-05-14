import { FC } from 'react'
import { avatarSizeClasses, UserAvatarSizes } from './constants'
import clsx from 'clsx'

interface UserAvatarProps {
  firstName?: string | null
  lastName?: string | null
  login?: string | null
  variant?: UserAvatarSizes
}

export const UserAvatar: FC<UserAvatarProps> = ({
  firstName,
  lastName,
  login,
  variant = UserAvatarSizes.S,
}) => {
  const firstInitial = firstName?.[0] ?? ''
  const lastInitial = lastName?.[0] ?? ''
  const nickname = (
    firstInitial || lastInitial
      ? `${firstInitial ? firstInitial + '.' : ''}${lastInitial ? lastInitial + '.' : ''}`
      : (login?.[0] ?? '')
  ).toUpperCase()

  return (
    <div
      className={clsx(
        'shrink-0 flex items-center justify-center rounded-full bg-yellow border border-secondary',
        avatarSizeClasses[variant],
      )}
      aria-label="Профиль пользователя"
    >
      {nickname}
    </div>
  )
}
