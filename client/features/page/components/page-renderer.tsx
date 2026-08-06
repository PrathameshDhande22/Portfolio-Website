import { BlockRenderer } from "./block-renderer";
import { StructuredData } from "@/features/shared/components/structured-data";
import type { Page } from "@/types/content";
import type { SearchParams } from "@/types/search-params";

export function PageRenderer({ page, searchParams }: { page: Page; searchParams?: SearchParams }) {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <StructuredData data={page.SEO?.StructuredData} />
      <BlockRenderer content={page.Content} searchParams={searchParams} />
    </div>
  );
}
