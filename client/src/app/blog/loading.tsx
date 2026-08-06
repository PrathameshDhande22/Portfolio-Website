import { Skeleton } from "@/components/ui/skeleton";
import {
  SectionSkeleton,
  TerminalLoader,
} from "@/features/shared/components/loading";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <SectionSkeleton />
      <div className="pb-6">
        <TerminalLoader
          trace={[
            { method: "GET", path: "/api/page?slug=blog", status: "200" },
            {
              method: "GET",
              path: "/api/blogs?pagination[page]=1",
              status: "200",
            },
          ]}
          pending="rendering posts"
        />
      </div>
      <div className="grid grid-cols-1 gap-3.5 tile:grid-cols-2 wide:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-80 rounded-tile" />
        ))}
      </div>
    </div>
  );
}
