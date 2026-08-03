import { getTimelineEntries, selectedDocumentIds, type TimelineSectionType } from "../service";
import { TimelineList } from "./timeline-list";
import type { SectionBlock } from "@/types/components";

export function createTimelineSection(type: TimelineSectionType) {
  return async function TimelineSection({ section }: { section: SectionBlock }) {
    const selected = selectedDocumentIds(type, section);
    const entries = await getTimelineEntries(type, section.ShowAll ? undefined : selected);

    return <TimelineList entries={entries} />;
  };
}
