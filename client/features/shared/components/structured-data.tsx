import type { StructuredData as StructuredDataBlock } from "@/types/components";

export function StructuredData({ data }: { data: StructuredDataBlock | null | undefined }) {
  if (!data?.Enable || !data.JSONSchema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data.JSONSchema).replace(/</g, "\\u003c") }}
    />
  );
}
