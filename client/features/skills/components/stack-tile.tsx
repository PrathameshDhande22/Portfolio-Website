import { getSkillCategories } from "../service";
import { SkillGlyph } from "./skill-card";
import { Tile, TileLabel } from "@/features/home/components/tile";
import type { SectionBlock } from "@/types/components";

const TILE_LIMIT = 8;

export async function StackTile({ section }: { section: SectionBlock }) {
  const selected = section.Categories.map((category) => category.documentId);
  const categories = await getSkillCategories(section.ShowAll ? undefined : selected);
  const skills = categories
    .flatMap((category) => category.Skills)
    .sort((a, b) => a.Order - b.Order)
    .slice(0, section.ShowAll ? undefined : TILE_LIMIT);

  if (skills.length === 0) return null;

  return (
    <Tile className="wide:col-span-2">
      <TileLabel>What I use</TileLabel>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {skills.map((skill) => (
          <li
            key={skill.documentId}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[0.82rem] font-medium whitespace-nowrap transition-[background-color,border-color,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft"
          >
            <span className="grid size-4 flex-none place-items-center text-ink-2">
              <SkillGlyph skill={skill} />
            </span>
            {skill.Name}
          </li>
        ))}
      </ul>
    </Tile>
  );
}
