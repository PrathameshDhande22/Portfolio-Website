"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { ResolvedImage } from "@/lib/media";

export function ProjectGallery({ shots, title }: { shots: ResolvedImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = shots[active];

  if (!current) return null;

  return (
    <div className="relative top-[0.35rem]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${title} screenshots`}
        className="relative block aspect-16/10 w-full cursor-zoom-in overflow-hidden rounded-tile border border-line bg-surface-2 p-0"
      >
        <Image
          src={current.url}
          alt={current.alt || title}
          fill
          sizes="(max-width: 900px) 100vw, 300px"
          className="object-contain"
        />
      </button>

      {shots.length > 1 ? (
        <ul className="m-0 mt-[0.55rem] flex list-none flex-wrap gap-2 p-0">
          {shots.map((shot, index) => (
            <li key={shot.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                onDoubleClick={() => setOpen(true)}
                aria-label={`${title} screenshot ${index + 1}`}
                aria-current={index === active}
                className={`block aspect-16/10 w-15 cursor-pointer overflow-hidden rounded-[7px] border bg-surface-2 p-0 transition-[opacity,border-color,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100 ${
                  index === active ? "border-accent opacity-100 ring-1 ring-accent" : "border-line opacity-70"
                }`}
              >
                <Image src={shot.url} alt="" width={60} height={38} className="size-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={active}
        on={{ view: ({ index }) => setActive(index) }}
        slides={shots.map((shot) => ({
          src: shot.url,
          alt: shot.alt || title,
          width: shot.width,
          height: shot.height,
        }))}
        plugins={shots.length > 1 ? [Zoom, Counter, Thumbnails] : [Zoom]}
        carousel={{ finite: true }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,.9)" } }}
      />
    </div>
  );
}
