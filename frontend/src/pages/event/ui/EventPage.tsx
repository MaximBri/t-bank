import { useState } from 'react'

import { mockSettlements } from '@/entities/settlement/model/mock.ts'
import { LeaveEventModal } from '@/features/LeaveEventModal'
import { renderActiveWidget } from '@/pages/event/lib/renderActiveWidget.tsx'
import { useSectionChange } from '@/shared/lib/page-sections/use-section-change.ts'
import { EventHeaderWidget } from '@/widgets/event-header'
import { EventSection, EventSectionsNavWidget } from '@/widgets/event-sections-nav'
import {
  eventDefaultSection,
  eventSections,
} from '@/widgets/event-sections-nav/model/contstants.ts'

export const EventPage = () => {
  const { activeSection, handleSectionChange } = useSectionChange<EventSection>({
    sections: eventSections,
    defaultSection: eventDefaultSection,
  })
  const [isLeaveEventModalOpen, setLeaveEventModalOpen] = useState(false)

  return (
    <>
      <main className="px-[10px] py-[10px] sm:px-[30px] sm:py-[20px]">
        <div className="mx-auto flex w-full flex-col gap-[15px] sm:gap-[20px]">
          <EventHeaderWidget onLeaveEventClick={() => setLeaveEventModalOpen(true)} />
          <EventSectionsNavWidget
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          {renderActiveWidget(activeSection)}
        </div>
      </main>

      <LeaveEventModal
        hasSettlements={mockSettlements.length > 0}
        isOpen={isLeaveEventModalOpen}
        onClose={() => setLeaveEventModalOpen(false)}
        onNavigateToSettlements={() => handleSectionChange(EventSection.settlements)}
      />
    </>
  )
}
