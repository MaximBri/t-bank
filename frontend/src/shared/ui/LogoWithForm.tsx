import type { ReactNode } from 'react'

type LogoWithFormProps = {
  children: ReactNode
}

export const LogoWithForm = ({ children }: LogoWithFormProps) => {
  return (
    <div className="flex gap-[12px] sm:gap-[16px] flex-col items-center">
      <div className="flex flex-col items-center">
        <img
          src="/logo.svg"
          alt="Logo"
          width="86px"
          height="86px"
          className="sm:w-[86px] sm:h-[86px] w-[55px] h-[55px]"
        />
        <p className="mt-[12px] mb-[12px] text-[28px] sm:mt-[10px] sm:mb-[17px] font-inter sm:text-[36px] text-primary">
          Т-Ивент
        </p>
        <p className="text-[14px] sm:text-[20px] text-muted">Совместное управление бюджетом</p>
      </div>

      {children}
    </div>
  )
}
