import { ICON_REGISTRY, PLATFORM_ICON } from "./icon-registry";

interface IconProps {
  name?: string | null;
  platform?: string | null;
  monogram?: string | null;
  className?: string;
}

export function Icon({ name, platform, monogram, className }: IconProps) {
  const Resolved = (name && ICON_REGISTRY[name]) || (platform && PLATFORM_ICON[platform]);

  if (Resolved) return <Resolved className={className} aria-hidden />;
  if (!monogram) return null;

  return (
    <span className="text-[0.62rem] font-semibold tracking-[0.04em] text-ink-3 uppercase" aria-hidden>
      {monogram.slice(0, 3)}
    </span>
  );
}
