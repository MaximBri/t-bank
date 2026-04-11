import type { ReactNode } from 'react'

type LogoWithFormProps = {
    children: ReactNode
}

export const LogoWithForm = ({ children }: LogoWithFormProps) => {
    return (
        <div className="flex gap-[49px] flex-col items-center">
            <div className="gap-[10px] flex flex-col items-center">
                <img src="/public/logo.svg" alt="Logo" />
                <h1 className="font-inter text-[36px] text-primary">Т-Ивент</h1>
                <p className="text-[20px] text-[#666666]">Совместное управление бюджетом</p>
            </div>

            {children}
        </div>
    )
}
