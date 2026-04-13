import type { ReactNode } from 'react'

type LogoWithFormProps = {
    children: ReactNode
}

export const LogoWithForm = ({ children }: LogoWithFormProps) => {
    return (
        <div className="flex gap-[16px] flex-col items-center">
            <div className="flex flex-col items-center">
                <img src="/logo.svg" alt="Logo" width="86px" height="86px"/>
                <h2 className="mt-[10px] mb-[17px] font-inter text-[36px] text-primary">Т-Ивент</h2>
                <p className="text-[20px] text-muted">Совместное управление бюджетом</p>
            </div>

            {children}
        </div>
    )
}
