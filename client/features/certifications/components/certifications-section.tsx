import { getCertifications } from "../service";
import { LinkOut } from "@/features/shared/components/link-out";
import { Reveal } from "@/features/shared/components/reveal";
import { formatMonthYear } from "@/lib/format";
import type { SectionBlock } from "@/types/components";
import type { Certification } from "@/types/content";

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-[0.72rem] font-medium text-ink-3">{label}</dt>
      <dd className="m-0 text-[0.82rem] font-semibold text-ink">{value}</dd>
    </div>
  );
}

async function CertificationCard({ certification }: { certification: Certification }) {
  const meta = [
    { label: "Issued", value: await formatMonthYear(certification.Issued) },
    { label: "Expires", value: await formatMonthYear(certification.Expires) },
    { label: "ID", value: certification.CertificateID ?? "" },
  ].filter((item) => item.value);

  return (
    <article className="relative border border-line bg-surface p-6 transition-[border-color,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-3">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="m-0 min-w-0 font-display text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
          {certification.Title}
        </h3>
        {certification.Active ? (
          <span className="rounded-full border border-accent bg-accent px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium text-accent-ink">
            Active
          </span>
        ) : null}
      </div>

      {certification.Certifier ? (
        <div className="mb-3 text-[0.8rem] font-medium text-ink-3">{certification.Certifier}</div>
      ) : null}

      {certification.Description ? (
        <p className="mb-4 max-w-[60ch] text-[0.9rem] leading-[1.7] text-ink-2">{certification.Description}</p>
      ) : null}

      {meta.length > 0 ? (
        <dl className="my-4 flex flex-wrap gap-x-8 gap-y-3">
          {meta.map((item) => (
            <MetaCell key={item.label} label={item.label} value={item.value} />
          ))}
        </dl>
      ) : null}

      {certification.VerifyLink ? <LinkOut link={certification.VerifyLink} /> : null}
    </article>
  );
}

export async function CertificationsSection({ section }: { section: SectionBlock }) {
  const selected = (section.Certifications ?? []).map((item) => item.documentId);
  const certifications = await getCertifications(section.ShowAll ? undefined : selected);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-px overflow-hidden rounded-tile border border-line bg-line">
      {certifications.map((certification) => (
        <Reveal key={certification.documentId} className="min-w-0">
          <CertificationCard certification={certification} />
        </Reveal>
      ))}
    </div>
  );
}
