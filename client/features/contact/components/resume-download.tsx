import { LuDownload } from "react-icons/lu";
import { fileUrl } from "@/lib/media";
import type { ResumeBlock } from "@/types/components";

export function ResumeDownload({ blocks }: { blocks: ResumeBlock[] }) {
  const resume = blocks[0]?.Resume;
  const href = fileUrl(resume);

  if (!resume || !href) return null;

  const sizeKb = Math.max(1, Math.round(resume.size));

  return (
    <a
      href={href}
      download
      className="flex max-w-105 items-center gap-[0.85rem] rounded-tile border border-line bg-surface p-4 no-underline transition-[border-color,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-accent"
    >
      <span className="grid h-11.5 w-9.5 flex-none place-items-center rounded-[5px] bg-accent font-display text-[0.6rem] font-bold tracking-[0.03em] text-accent-ink">
        {resume.ext.replace(".", "").toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[0.9rem] font-semibold wrap-anywhere text-ink">{resume.name}</strong>
        <span className="mt-[0.1rem] block text-[0.78rem] text-ink-3">Download resume · {sizeKb} KB</span>
      </span>
      <LuDownload className="size-4.5 flex-none text-accent" aria-hidden />
    </a>
  );
}
