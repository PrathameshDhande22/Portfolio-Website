import Image from "next/image";
import { Icon } from "@/features/shared/components/icon";
import { ICON_REGISTRY } from "@/features/shared/components/icon-registry";
import { resolveImage } from "@/lib/media";
import type { Skill } from "@/types/content";

export function SkillGlyph({ skill }: { skill: Skill }) {
  if (skill.IconClass && ICON_REGISTRY[skill.IconClass]) {
    return <Icon name={skill.IconClass} className="size-5.5" />;
  }

  const uploaded = resolveImage(skill.Icon, 44);
  if (uploaded) {
    return <Image src={uploaded.url} alt="" width={22} height={22} className="size-5.5 object-contain" />;
  }

  return (
    <span className="rounded-[3px] border-[1.5px] px-[0.2rem] py-[0.15rem] font-display text-[0.56rem] leading-none font-bold whitespace-nowrap">
      {skill.Name.slice(0, 3).toUpperCase()}
    </span>
  );
}

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <li className="flex items-center gap-[0.85rem] rounded-xl border border-line bg-surface px-4 py-[0.8rem] transition-[border-color,transform,box-shadow] duration-200 ease-smooth hover:-translate-y-0.75 hover:border-accent">
      <span className="grid h-7.5 w-10.5 flex-none place-items-center text-ink-2">
        <SkillGlyph skill={skill} />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.9rem] font-semibold wrap-anywhere">{skill.Name}</span>
      </span>
    </li>
  );
}
