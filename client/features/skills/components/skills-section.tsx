import { getSkillCategories } from "../service";
import { SkillCard } from "./skill-card";
import { Reveal } from "@/features/shared/components/reveal";
import type { SectionBlock } from "@/types/components";

export async function SkillsSection({ section }: { section: SectionBlock }) {
  const selected = section.Categories.map((category) => category.documentId);
  const categories = await getSkillCategories(section.ShowAll ? undefined : selected);

  return (
    <div>
      {categories.map((category) => (
        <Reveal key={category.documentId} className="mb-10 max-w-180 last:mb-0">
          <div className="mb-[0.85rem] flex items-baseline gap-3 border-b border-line pb-2">
            <h3 className="m-0 font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-ink">
              {category.Name}
            </h3>
            <span className="ml-auto text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">
              {category.Skills.length}
            </span>
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-[0.55rem] p-0">
            {[...category.Skills]
              .sort((a, b) => a.Order - b.Order)
              .map((skill) => (
                <SkillCard key={skill.documentId} skill={skill} />
              ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
