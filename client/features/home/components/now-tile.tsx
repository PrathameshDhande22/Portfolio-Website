import { Tile } from "./tile";
import type { HomeHero } from "@/types/components";

export function NowTile({ hero }: { hero: HomeHero }) {
  return (
    <Tile className="wide:col-span-2">
      <h2 className="mb-[0.3rem] font-display text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
        {hero.AboutTitle}
      </h2>
      <p className="m-0 mb-[0.7rem] text-[0.8rem] font-semibold text-accent">{hero.Company}</p>
      {hero.CompanyDescription.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph} className="mb-4 max-w-[48ch] text-[0.88rem] leading-[1.65] text-ink-2">
          {paragraph}
        </p>
      ))}
    </Tile>
  );
}
