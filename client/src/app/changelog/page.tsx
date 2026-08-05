import type { Metadata } from "next";
import { getVersions } from "@/features/version/service";
import { SectionLabel } from "@/features/shared/components/section-label";
import { Markdown } from "@/features/shared/components/markdown";
import { Reveal } from "@/features/shared/components/reveal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Changelog",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ChangelogPage() {
  const versions = await getVersions();

  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <section className="py-[clamp(2.25rem,4.5vw,3.25rem)]">
        <SectionLabel left="Changelog" right={`${versions.length} releases`} />
        <h1 className="mb-[0.7rem] font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
          Changelog
        </h1>
        <p className="max-w-[58ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-ink-2">
          What changed in each release of this site.
        </p>
      </section>

      <section className="border-t border-line py-[clamp(2.25rem,4.5vw,3.25rem)]">
        <div className="relative pl-7">
          {versions.map(async (version) => (
            <Reveal
              key={version.documentId}
              from="left"
              className="relative pb-8 before:absolute before:top-[0.55rem] before:-left-7 before:size-1.75 before:rounded-full before:bg-accent before:content-['']"
            >
              <div className="text-[0.82rem] font-semibold text-accent">
                {await formatDate(version.createdAt)}
              </div>
              <h2 className="mt-1 mb-[0.35rem] font-display text-[1.2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
                {version.Version}
              </h2>
              <Markdown content={version.ChangeLog} className="max-w-[62ch]" />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
