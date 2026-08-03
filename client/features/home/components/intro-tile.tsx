import Image from "next/image";
import { TILE_BASE } from "./tile";
import { TypingText } from "./typing-text";
import { MeshSphere } from "./mesh-sphere";
import { CmsButton } from "@/features/shared/components/cms-button";
import { resolveImage } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { HomeHero } from "@/types/components";

export function IntroTile({ hero }: { hero: HomeHero }) {
  const face = resolveImage(hero.ProfileImage, 168);

  return (
    <section
      className={cn(
        TILE_BASE,
        "justify-center border-transparent bg-slab p-[clamp(2rem,3.5vw,3.25rem)] text-slab-fg shadow-[0_14px_40px_-18px_#0000008c] hover:border-transparent wide:col-span-4"
      )}
    >
      <MeshSphere />

      <div className="relative z-1 mb-4 flex min-w-0 items-center gap-4">
        {face ? (
          <Image
            src={face.url}
            alt={face.alt}
            width={face.width}
            height={face.height}
            priority
            className="size-[clamp(64px,7vw,84px)] flex-none rounded-full border border-slab-fg bg-surface-2 object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
            {hero.Name}
          </h1>
          <TypingText phrases={hero.TypingText} />
        </div>
      </div>

      <p className="relative z-1 mt-[1.1rem] mb-7 max-w-[46ch] text-[clamp(0.98rem,1.3vw,1.08rem)] leading-[1.65] opacity-72">
        {hero.Description}
      </p>

      {hero.Buttons.length > 0 ? (
        <div className="relative z-1 flex flex-wrap gap-[0.6rem]">
          {hero.Buttons.map((button) => (
            <CmsButton key={button.id} button={button} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
