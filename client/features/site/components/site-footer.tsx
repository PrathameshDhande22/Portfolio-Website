import type { FooterLink } from "@/types/components";

interface SiteFooterProps {
  copyright: string | null;
  links: FooterLink[];
}

export function SiteFooter({ copyright, links }: SiteFooterProps) {
  return (
    <footer className="border-t border-line bg-surface py-8">
      <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-4 px-pad">
        {copyright ? <p className="m-0 text-[0.82rem] text-ink-3">{copyright}</p> : null}
        {links.length > 0 ? (
          <nav aria-label="Footer" className="ml-auto flex gap-5">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.Url}
                target={link.OpenInNewTab ? "_blank" : undefined}
                rel={link.OpenInNewTab ? "noopener noreferrer" : undefined}
                className="text-[0.82rem] font-medium text-ink-2 no-underline hover:text-accent"
              >
                {link.Title}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
