import { Outlet } from 'react-router-dom'

import LogoIcon from '@/shared/assets/icons/logo.svg?react'

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between p-[10px] md:px-medium"
        role="banner"
      >
        <div className="flex items-center gap-4 max-lg:gap-3">
          <LogoIcon
            className="block h-[50px] w-[50px] shrink-0 max-md:h-10 max-md:w-10"
            width={50}
            height={50}
            aria-label="Логотип Т-Ивент"
          />
          <div className="flex flex-col">
            <p className="m-0 text-[20px] md:leading-[29px] md:text-h3-d">
              Т-Ивент
            </p>
            <p className="hidden m-0 mt-[2px] md:inline leading-[19px]">
              Управление бюджетом
            </p>
          </div>
        </div>
        <div
          className="flex w-10 h-10 md:h-[60px] md:w-[60px] items-center justify-center rounded-full bg-yellow text-h3-d"
          aria-label="Профиль пользователя"
        >
          М.
        </div>
      </header>
      <Outlet />
    </div>
  )
}
