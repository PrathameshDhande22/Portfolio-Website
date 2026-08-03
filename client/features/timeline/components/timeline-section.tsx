import { getTimelines } from "../service";
import { TimelineList } from "./timeline-list";
import type { SectionBlock } from "@/types/components";

export async function TimelineSection({ section }: { section: SectionBlock }) {
  const selected = section.Timelines.map((item) => item.documentId);
  const timelines = await getTimelines(section.ShowAll ? undefined : selected);

  return <TimelineList entries={timelines.map((item) => item.Timeline)} />;
}
