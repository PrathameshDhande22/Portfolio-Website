import { Tile } from "./tile";
import type { HomeHero } from "@/types/components";

interface OpenRolesTileProps {
  hero: HomeHero;
  email: string;
}

export function OpenRolesTile({ hero, email }: OpenRolesTileProps) {
  if (!hero.OpentonewRolesText) return null;

  return (
    <Tile className="self-start border-transparent bg-ink text-paper hover:border-transparent wide:col-span-2">
      <h2 className="mb-[0.35rem] font-display text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.02em] text-inherit">
        {hero.OpentonewRolesText}
      </h2>
      {hero.OpentoNewRolesDescription ? (
        <p className="m-0 mb-7 max-w-[40ch] text-[0.88rem] leading-[1.6] text-inherit opacity-80">
          {hero.OpentoNewRolesDescription}
        </p>
      ) : null}
      <a
        href={`mailto:${email}`}
        className="block w-full border-b border-current/25 pb-2 font-display text-[1.05rem] font-semibold text-inherit no-underline transition-colors wrap-anywhere hover:border-current"
      >
        {email}
      </a>
    </Tile>
  );
}
