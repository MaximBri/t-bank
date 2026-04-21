import type {EventSection} from '@/widgets/event-sections-nav'
import {sectionTitleMap} from "@/widgets/event-section-placeholder/model/contstants.ts";

type EventSectionPlaceholderWidgetProps = {
  section: EventSection
}

export const EventSectionPlaceholderWidget = ({
  section,
}: EventSectionPlaceholderWidgetProps) => {
  return (
      <section className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-row items-center justify-center gap-[10px]">
                  <p className="text-h1 font-medium text-primary sm:text-h1-d">{sectionTitleMap[section]}</p>
              </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border-[2px] border-primary bg-secondary p-[20px]">
              <p className="text-h3-d text-muted">
                Секция пока не готова
              </p>
          </div>
      </section>
  )
}
