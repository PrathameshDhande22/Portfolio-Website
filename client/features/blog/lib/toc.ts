import { headingSlug } from "@/features/shared/components/markdown";

export function tocFromMarkdown(markdown: string | null | undefined) {
  if (!markdown) return [];

  return [...markdown.matchAll(/^[ \t]*#{1,3}[ \t]+(.+?)[ \t]*#*$/gm)].map((match) => ({
    id: headingSlug(match[1].trim()),
    label: match[1].trim(),
  }));
}
