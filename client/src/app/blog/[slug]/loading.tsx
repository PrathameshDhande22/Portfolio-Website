import { Skeleton } from "@/components/ui/skeleton";
import { TerminalLoader } from "@/features/shared/components/loading";

export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <div className="pt-[clamp(2.25rem,4.5vw,3.25rem)]">
        <Skeleton className="mb-6 h-3 w-28" />
        <Skeleton className="mb-4 h-3 w-56" />
        <Skeleton className="mb-3 h-12 w-4/5 max-w-2xl" />
        <Skeleton className="mb-10 h-5 w-3/5 max-w-xl" />

        <TerminalLoader
          trace={[
            { method: "GET", path: "/api/blogs?filters[Slug]", status: "200" },
            { method: "GET", path: "/api/blog-contents", status: "200" },
          ]}
          pending="highlighting code blocks"
        />
      </div>
    </div>
  );
}
