import { BlockRenderer } from "./block-renderer";
import { StructuredData } from "@/features/shared/components/structured-data";
import type { Page } from "@/types/content";

export function PageRenderer({ page }: { page: Page }) {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <StructuredData data={page.SEO?.StructuredData} />
      <BlockRenderer content={page.Content} />
    </div>
  );
}
