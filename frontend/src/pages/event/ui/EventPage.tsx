
import { EventExpensesWidget } from '@/widgets/event-expenses'
import { EventHeaderWidget } from '@/widgets/event-header'
import { EventSectionPlaceholderWidget } from '@/widgets/event-section-placeholder'
import { EventSection, EventSectionsNavWidget } from '@/widgets/event-sections-nav'
import { eventSections, eventDefaultSection } from "@/widgets/event-sections-nav/model/contstants.ts";
import { useSectionChange } from '@/shared/lib/page-sections/use-section-change.ts'

export const EventPage = () => {
  const { activeSection, handleSectionChange } = useSectionChange<EventSection>(
      {
          sections: eventSections,
          defaultSection: eventDefaultSection
      }
  )

  return (
    <main className="px-[10px] py-[10px] sm:px-[30px] sm:py-[20px]">
      <section className="mx-auto flex w-full flex-col gap-[20px]">
        <EventHeaderWidget />
        <EventSectionsNavWidget
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        {activeSection === 'expenses' ? (
          <EventExpensesWidget />
        ) : (
          <EventSectionPlaceholderWidget section={activeSection} />
        )}
      </section>
    </main>
  )
}
