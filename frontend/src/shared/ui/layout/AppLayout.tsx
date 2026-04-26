import { Link, Outlet } from 'react-router-dom'

import LogoIcon from '@/shared/assets/icons/logo.svg?react'
import { APP_ROUTES } from '@/shared/routes'
import { Text } from '../text/Text'
import { UserAvatar } from '../userAvatar/UserAvatar'
import { useMediaQuery } from 'react-responsive'
import { UserAvatarSizes } from '../userAvatar/constants'
import { useUserStore } from '@/entities/user'

export const AppLayout = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const user = useUserStore((state) => state.user)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-[10px] md:px-medium" role="banner">
        <div className="flex items-center gap-4 max-lg:gap-3">
          <Link to={APP_ROUTES.HOME} aria-label="Перейти на главную">
            <LogoIcon
              className="block h-10 w-10 sm:h-[50px] sm:w-[50px] shrink-0 max-md:h-10 max-md:w-10"
              width={50}
              height={50}
              aria-hidden="true"
            />
          </Link>
          <div className="flex flex-col">
            <Text as="h2" variant="h2" className="max-h-[29px]">
              Т-Ивент
            </Text>
            <Text className="hidden m-0 mt-[2px] md:inline leading-[1.2]">Управление бюджетом</Text>
          </div>
        </div>
        <UserAvatar
          variant={isMobile ? UserAvatarSizes.Xs : UserAvatarSizes.S}
          email={user?.username}
        />
      </header>
      <Outlet />
    </div>
  )
}
