import type { Metadata } from "next";
import { getAiSettings } from "@/features/ai/service";
import { getSiteSettings } from "@/features/site/service";
import { SectionLabel } from "@/features/shared/components/section-label";

export async function generateMetadata(): Promise<Metadata> {
  const ai = await getAiSettings();

  return {
    title: ai.Header,
    description: ai.Description ?? undefined,
    alternates: { canonical: "/assistant" },
  };
}

export default async function AssistantPage() {
  const [ai, settings] = await Promise.all([getAiSettings(), getSiteSettings()]);

  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <section className="py-[clamp(2.25rem,4.5vw,3.25rem)]">
        <SectionLabel left="Curious?" right={settings.SiteName} />
        <h1 className="mb-[0.7rem] font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
          {ai.Header}
        </h1>
        {ai.Description ? (
          <p className="max-w-[58ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-ink-2">
            {ai.Description}
          </p>
        ) : null}
      </section>
    </div>
  );
}
