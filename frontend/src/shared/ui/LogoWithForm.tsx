import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import LogoIcon from '@/shared/assets/icons/logo.svg?react'
import { APP_ROUTES } from '@/shared/routes'
import { Text } from './text/Text'

type LogoWithFormProps = {
  children: ReactNode
}

export const LogoWithForm = ({ children }: LogoWithFormProps) => {
  return (
    <div className="flex gap-[12px] sm:gap-[16px] flex-col items-center">
      <div className="flex flex-col items-center">
        <Link to={APP_ROUTES.HOME} aria-label="Перейти на главную">
          <LogoIcon
            className="sm:w-[86px] sm:h-[86px] w-[55px] h-[55px]"
            width={86}
            height={86}
            aria-hidden="true"
          />
        </Link>
        <Text variant="h1" as="h1" className="mt-[12px] mb-[12px] sm:mt-[10px] sm:mb-[17px]">
          Т-Ивент
        </Text>
        <Text as="p" variant="small" className="text-muted sm:text-h3-d">
          Совместное управление бюджетом
        </Text>
      </div>
      {children}
    </div>
  )
}
