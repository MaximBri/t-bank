import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useGetEventSettlements } from '@/entities/settlement'
import { useGetEvent } from '@/entities/event/api/hooks/useGetEvent'
import { useLeaveEvent } from '@/entities/event/api/hooks/useLeaveEvent'
import { LeaveEventModal } from '@/features/LeaveEventModal'
import { renderActiveWidget } from '@/pages/event/lib/renderActiveWidget.tsx'
import { useSectionChange } from '@/shared/lib/page-sections/use-section-change.ts'
import { APP_ROUTES } from '@/shared/routes'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { EventHeaderWidget } from '@/widgets/event-header'
import { EventSection, EventSectionsNavWidget } from '@/widgets/event-sections-nav'
import {
  eventDefaultSection,
  eventSections,
} from '@/widgets/event-sections-nav/model/contstants.ts'
import {SettlementStatus} from "@/entities/settlement/model/types.ts";

export const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { activeSection, handleSectionChange } = useSectionChange<EventSection>({
    sections: eventSections,
    defaultSection: eventDefaultSection,
  })
  const [isLeaveEventModalOpen, setLeaveEventModalOpen] = useState(false)
  const { data: event } = useGetEvent(eventId)
  const { data: settlementsForLeave = [] } = useGetEventSettlements(eventId, event?.isCompleted)
  const { mutate: leaveEvent } = useLeaveEvent(eventId ?? '')

  const handleLeaveSubmit = () => {
    leaveEvent(undefined, {
      onSuccess: () => toast.success('Вы покинули событие'),
      onError: () => toast.error('Не удалось покинуть событие'),
    })
  }

  return (
    <>
      <main className="px-[10px] py-[10px] sm:px-[30px] sm:py-[20px]">
        <div className="mx-auto flex w-full flex-col gap-[15px] sm:gap-[20px]">
          <Breadcrumbs
            items={[
              { label: 'Главная', to: APP_ROUTES.HOME },
              { label: event?.title ?? 'Событие' },
            ]}
          />
          <EventHeaderWidget onLeaveEventClick={() => setLeaveEventModalOpen(true)} />
          <EventSectionsNavWidget
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          {renderActiveWidget(activeSection)}
        </div>
      </main>

      <LeaveEventModal
        hasSettlements={settlementsForLeave.filter( (settlement) => settlement.status !== SettlementStatus.Completed ).length > 0}
        isOpen={isLeaveEventModalOpen}
        onClose={() => setLeaveEventModalOpen(false)}
        onNavigateToSettlements={() => handleSectionChange(EventSection.settlements)}
        onSubmit={handleLeaveSubmit}
      />
    </>
  )
}
