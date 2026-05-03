import { EventSection } from '../model/types.ts'
import { getIconBySection } from '@/widgets/event-sections-nav/lib/get-icon-by-section.tsx'
import { tabs } from '@/widgets/event-sections-nav/model/contstants.ts'
import { Text } from '@/shared/ui/text/Text.tsx'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

type EventSectionsNavWidgetProps = {
  activeSection: EventSection
  onSectionChange: (section: EventSection) => void
}

export const EventSectionsNavWidget = ({
  activeSection,
  onSectionChange,
}: EventSectionsNavWidgetProps) => {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      inline: 'center',
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [activeSection])
  return (
    <nav className="overflow-x-auto rounded-[16px] border-[2px] border-primary bg-secondary py-[8px] sm:pt-[20px] sm:pb-[15px]">
      <ul className="flex w-max min-w-full gap-[20px] px-[24px] sm:gap-[40px] sm:px-[56px]">
        {tabs.map((tab) => (
          <li key={tab.key} className="shrink-0 sm:flex-1 sm:basis-0">
            <button
              ref={tab.key === activeSection ? activeButtonRef : null}
              type="button"
              className={clsx(
                'flex w-full min-w-[236px] items-center justify-center gap-[12px] border-b-[4px] border-transparent text-h2 font-semibold sm:min-w-0 sm:text-h2-d',
                tab.key === activeSection ? 'border-yellow' : null,
              )}
              onClick={() => onSectionChange(tab.key)}
            >
              <span aria-hidden="true">{getIconBySection(tab.key)}</span>
              <Text variant="h2" as="h2" className="font-semibold">
                {tab.label}
              </Text>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
