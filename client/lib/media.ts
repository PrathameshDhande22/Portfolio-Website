import type { StrapiImageFormatName, StrapiMedia } from "@/types/strapi";

const SMALLEST_FIRST: StrapiImageFormatName[] = ["thumbnail", "small", "medium", "large"];

export interface ResolvedImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

function absolute(url: string): string {
  return url.startsWith("http") ? url : `${process.env.MEDIA_URL ?? ""}${url}`;
}

export function resolveImage(media: StrapiMedia | null | undefined, minWidth = 0): ResolvedImage | null {
  if (!media) return null;

  const alt = media.alternativeText ?? media.name;
  const format = SMALLEST_FIRST.map((name) => media.formats?.[name]).find(
    (candidate) => candidate && candidate.width >= minWidth
  );

  if (format) {
    return { url: absolute(format.url), width: format.width, height: format.height, alt };
  }

  return {
    url: absolute(media.url),
    width: media.width ?? minWidth,
    height: media.height ?? minWidth,
    alt,
  };
}

export function fileUrl(media: StrapiMedia | null | undefined): string | null {
  return media ? absolute(media.url) : null;
}
