import { FC } from 'react'
import { avatarSizeClasses, UserAvatarSizes } from './constants'
import clsx from 'clsx'

interface UserAvatarProps {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  variant?: UserAvatarSizes
}

export const UserAvatar: FC<UserAvatarProps> = ({
  firstName,
  lastName,
  email,
  variant = UserAvatarSizes.S,
}) => {
  const hasLastName = !!lastName
  const nickname =
    `${firstName?.[0] ?? email?.[0] ?? ''}.${hasLastName ? lastName?.[0] + '.' : ''}`.toUpperCase()

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-yellow border border-secondary',
        avatarSizeClasses[variant],
      )}
      aria-label="Профиль пользователя"
    >
      {nickname}
    </div>
  )
}
