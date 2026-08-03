import { TimelineItem } from "./timeline-item";
import type { TimeLineEntry } from "@/types/components";

export function TimelineList({ entries }: { entries: TimeLineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="relative pl-7">
      {entries.map((entry) => (
        <TimelineItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
