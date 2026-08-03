import { Icon } from "@/features/shared/components/icon";
import type { SocialLink } from "@/types/components";

export function SocialLinksBlock({ blocks }: { blocks: SocialLink[] }) {
  const links = blocks.filter((link) => link.Visible).sort((a, b) => a.Order - b.Order);
  if (links.length === 0) return null;

  return (
    <ul className="m-0 list-none p-0">
      {links.map((link) => (
        <li key={link.id} className="border-t border-line first:border-t-0">
          <a
            href={link.Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-[0.9rem] text-[0.95rem] font-medium text-ink no-underline transition-colors hover:text-accent [&_svg]:size-4 [&_svg]:text-ink-3 hover:[&_svg]:text-accent"
          >
            <Icon name={link.Icon} platform={link.Platform} />
            <span className="capitalize">{link.Platform}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
