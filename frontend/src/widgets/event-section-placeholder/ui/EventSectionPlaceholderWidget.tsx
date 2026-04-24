import type { EventSection } from '@/widgets/event-sections-nav'
import { sectionTitleMap } from '@/widgets/event-section-placeholder/model/contstants.ts'
import { Text } from '@/shared/ui/text/Text'

type EventSectionPlaceholderWidgetProps = {
  section: EventSection
}

export const EventSectionPlaceholderWidget = ({ section }: EventSectionPlaceholderWidgetProps) => {
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row items-center justify-center gap-[10px]">
          <Text variant="h1" as="h1">
            {sectionTitleMap[section]}
          </Text>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border-[2px] border-primary bg-secondary p-[20px]">
        <Text variant="h3" className="text-muted">
          Секция пока не готова
        </Text>
      </div>
    </section>
  )
}
