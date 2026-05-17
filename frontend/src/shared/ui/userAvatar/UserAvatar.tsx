import { FC, useEffect, useState } from 'react'
import { avatarSizeClasses, UserAvatarSizes } from './constants'
import clsx from 'clsx'

interface UserAvatarProps {
  firstName?: string | null
  lastName?: string | null
  login?: string | null
  avatarUrl?: string | null
  variant?: UserAvatarSizes
}

export const UserAvatar: FC<UserAvatarProps> = ({
  firstName,
  lastName,
  login,
  avatarUrl,
  variant = UserAvatarSizes.S,
}) => {
  const firstInitial = firstName?.[0] ?? ''
  const lastInitial = lastName?.[0] ?? ''
  const nickname = (
    firstInitial || lastInitial
      ? `${firstInitial ? firstInitial + '.' : ''}${lastInitial ? lastInitial + '.' : ''}`
      : (login?.[0] ?? '')
  ).toUpperCase()

  // Fall back to initials if the resolved image fails to load (e.g. expired URL).
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    setImageFailed(false)
  }, [avatarUrl])

  const showImage = Boolean(avatarUrl) && !imageFailed

  return (
    <div
      className={clsx(
        'shrink-0 flex items-center justify-center overflow-hidden rounded-full',
        showImage ? 'bg-secondary' : 'bg-yellow border border-secondary',
        avatarSizeClasses[variant],
      )}
      aria-label="Профиль пользователя"
    >
      {showImage ? (
        <img
          src={avatarUrl as string}
          alt="Аватар пользователя"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        nickname
      )}
    </div>
  )
}
