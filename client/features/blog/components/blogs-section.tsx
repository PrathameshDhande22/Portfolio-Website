import { Suspense } from "react";
import { BlogList } from "./blog-list";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchParams } from "@/types/search-params";

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3.5 tile:grid-cols-2 wide:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-80 rounded-tile" />
      ))}
    </div>
  );
}

async function PaginatedBlogList({ searchParams }: { searchParams?: SearchParams }) {
  const requested = Number((await searchParams)?.page);
  const currentPage = Number.isFinite(requested) && requested > 0 ? requested : 1;

  return <BlogList currentPage={currentPage} />;
}

export function BlogsSection({ searchParams }: { searchParams?: SearchParams }) {
  return (
    <Suspense fallback={<BlogGridSkeleton />}>
      <PaginatedBlogList searchParams={searchParams} />
    </Suspense>
  );
}
