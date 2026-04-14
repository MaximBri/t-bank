import { Outlet } from 'react-router-dom'

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex h-[80px] items-center justify-between px-medium max-[900px]:h-[72px]"
        role="banner"
      >
        <div className="flex items-center gap-4 max-[900px]:gap-3">
          <img
            className="block h-[50px] w-[50px] shrink-0 max-[900px]:h-11 max-[900px]:w-11"
            src="/logo.svg"
            width={50}
            height={50}
            alt="Логотип Т-Ивент"
          />
          <div className="flex flex-col">
            <p className="m-0 text-h1-d leading-[29px]">
              Т-Ивент
            </p>
            <p className="m-0 mt-[2px] leading-[19px]">
              Управление бюджетом
            </p>
          </div>
        </div>
        <div
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-yellow text-h3-d"
          aria-label="Профиль пользователя"
        >
          М.
        </div>
      </header>
      <Outlet />
    </div>
  )
}
