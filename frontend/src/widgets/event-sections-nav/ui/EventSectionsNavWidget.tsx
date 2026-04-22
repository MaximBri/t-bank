import { EventSection } from '../model/types.ts'
import { getIconBySection } from "@/widgets/event-sections-nav/lib/get-icon-by-section.tsx";
import { tabs } from "@/widgets/event-sections-nav/model/contstants.ts";
import { Text } from '@/shared/ui/text/Text.tsx'
import clsx from "clsx";

type EventSectionsNavWidgetProps = {
  activeSection: EventSection
  onSectionChange: (section: EventSection) => void
}

export const EventSectionsNavWidget = ({
  activeSection,
  onSectionChange,
}: EventSectionsNavWidgetProps) => {
  return (
    <nav className="overflow-x-auto px-[24px] py-[8px] sm:px-[56px] sm:pt-[20px] sm:pb-[15px] rounded-[16px] border-[2px] border-primary bg-secondary">
      <ul className="flex gap-[20px] sm:gap-[40px] min-w-[760px]">
        {tabs.map((tab) => (
          <li key={tab.key} className="flex-1">
            <button
              type="button"
              className={clsx(
              "flex w-full min-w-[236px] items-center justify-center gap-[12px] border-b-[4px] border-transparent text-h2 sm:text-h2-d font-semibold",
                  tab.key === activeSection ? 'border-yellow': null
              )
              }
              onClick={() => onSectionChange(tab.key)}
            >
              <span aria-hidden="true">{getIconBySection(tab.key)}</span>
              <Text variant="h2" as="h2" className="font-semibold">{tab.label}</Text>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
