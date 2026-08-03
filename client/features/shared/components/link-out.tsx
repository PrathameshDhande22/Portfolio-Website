import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { Icon } from "./icon";
import type { LinkItem } from "@/types/components";

const STYLES =
  "inline-flex items-center gap-[0.4rem] border-b border-transparent pb-[0.1rem] text-[0.88rem] font-semibold text-accent no-underline transition-colors duration-200 hover:border-accent [&_svg]:size-[13px] [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-smooth hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5";

export function LinkOut({ link }: { link: LinkItem }) {
  const glyph = link.Icon ? (
    <Icon name={link.Icon} className="size-3.25" />
  ) : link.OpenInNewTab ? (
    <LuArrowUpRight aria-hidden />
  ) : null;

  const content = (
    <>
      {link.IconAlign === "left" ? glyph : null}
      {link.Text}
      {link.IconAlign !== "left" ? glyph : null}
    </>
  );

  if (link.OpenInNewTab) {
    return (
      <a href={link.Url} target="_blank" rel="noopener noreferrer" className={STYLES}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.Url} className={STYLES}>
      {content}
    </Link>
  );
}
