import {EventSection} from "@/widgets/event-sections-nav";
import {EventExpensesWidget} from "@/widgets/event-expenses";
import {EventSectionPlaceholderWidget} from "@/widgets/event-section-placeholder";
import {EventSettlementsWidget} from "@/widgets/event-settlements/ui/EventSettlementsWidget.tsx";

export const renderActiveWidget = (activeSection: EventSection = EventSection.expenses) => {
    switch (activeSection) {
        case EventSection.expenses:
            return <EventExpensesWidget />
        case EventSection.settlements:
            return <EventSettlementsWidget />
        default:
            return <EventSectionPlaceholderWidget section={activeSection}></EventSectionPlaceholderWidget>
    }
}