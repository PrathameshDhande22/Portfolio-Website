import type { StructuredData as StructuredDataBlock } from "@/types/components";

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

export function StructuredData({ data }: { data: StructuredDataBlock | null | undefined }) {
  if (!data?.Enable || !data.JSONSchema) return null;

  return <JsonLd schema={data.JSONSchema} />;
}
