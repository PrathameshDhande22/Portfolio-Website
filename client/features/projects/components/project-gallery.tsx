"use client";

import { useState } from "react";
import Image from "next/image";
import type { ResolvedImage } from "@/lib/media";

export function ProjectGallery({ shots, title }: { shots: ResolvedImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = shots[active];

  if (!current) return null;

  return (
    <div className="relative top-[0.35rem]">
      <div className="relative block aspect-16/10 w-full overflow-hidden rounded-tile border border-line bg-accent-soft">
        <Image
          src={current.url}
          alt={current.alt || title}
          fill
          sizes="(max-width: 900px) 100vw, 300px"
          className="object-cover"
        />
      </div>

      {shots.length > 1 ? (
        <ul className="m-0 mt-[0.55rem] flex list-none flex-wrap gap-2 p-0">
          {shots.map((shot, index) => (
            <li key={shot.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${title} screenshot ${index + 1}`}
                aria-current={index === active}
                className={`block aspect-16/10 w-15 cursor-pointer overflow-hidden rounded-[7px] border bg-accent-soft p-0 transition-[opacity,border-color,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100 ${
                  index === active ? "border-accent opacity-100 ring-1 ring-accent" : "border-line opacity-70"
                }`}
              >
                <Image src={shot.url} alt="" width={60} height={38} className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
