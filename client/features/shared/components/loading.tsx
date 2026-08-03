import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

const DEFAULT_TRACE = [
  { method: "GET", path: "/api/site-setting", status: "200" },
  { method: "GET", path: "/api/page", status: "200" },
  { method: "GET", path: "/api/skill-categories", status: "200" },
  { method: "CDN", path: "resolving media assets", status: "ok" },
];

interface TerminalLoaderProps {
  trace?: { method: string; path: string; status: string }[];
  pending?: string;
}

export function TerminalLoader({ trace = DEFAULT_TRACE, pending = "rendering components" }: TerminalLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="overflow-hidden rounded-tile border border-line bg-surface font-mono text-[0.8rem] leading-[1.9] text-ink-2"
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-[0.72rem] tracking-[0.06em] text-ink-3 uppercase">loading</span>
      </div>

      <div className="px-4 py-3">
        {trace.map((line, index) => (
          <div
            key={line.path}
            className="flex animate-in items-center gap-2 fade-in fill-mode-both"
            style={{ animationDelay: `${index * 140}ms` }}
          >
            <span className="text-accent">$</span>
            <span className="text-ink-3">{line.method}</span>
            <span className="truncate">{line.path}</span>
            <span className="min-w-4 flex-1 border-b border-dashed border-line" />
            <span className="text-accent">{line.status}</span>
          </div>
        ))}

        <div
          className="flex animate-in items-center gap-2 fade-in fill-mode-both"
          style={{ animationDelay: `${trace.length * 140}ms` }}
        >
          <span className="text-accent">$</span>
          <span className="truncate">{pending}</span>
          <span className="min-w-4 flex-1 border-b border-dashed border-line" />
          <Spinner className="size-3.5 text-accent" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="py-[clamp(2.25rem,4.5vw,3.25rem)]">
      <Skeleton className="mb-6 h-3 w-40" />
      <Skeleton className="mb-4 h-10 w-2/3 max-w-md" />
      <Skeleton className="mb-2 h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-4/5 max-w-md" />
    </div>
  );
}

export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-[0.55rem]">
      {Array.from({ length: items }, (_, index) => (
        <Skeleton key={index} className="h-14.5 rounded-xl" />
      ))}
    </div>
  );
}
