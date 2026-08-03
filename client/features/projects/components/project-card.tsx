import { ProjectGallery } from "./project-gallery";
import { LinkOut } from "@/features/shared/components/link-out";
import { Reveal } from "@/features/shared/components/reveal";
import { TagList } from "@/features/shared/components/tag-list";
import { formatYearRange } from "@/lib/format";
import { resolveImage, type ResolvedImage } from "@/lib/media";
import type { Project } from "@/types/content";

export async function ProjectCard({ project }: { project: Project }) {
  const shots = [project.Thumbnail, ...(project.Screenshots ?? [])]
    .map((media) => resolveImage(media, 640))
    .filter((shot): shot is ResolvedImage => shot !== null);

  const tags = (project.Tags ?? [])
    .map((tag) => ({ id: tag.id, label: tag.Technology?.Name ?? tag.Tag ?? "" }))
    .filter((tag) => tag.label);

  const links = project.Links ?? [];

  const years = await formatYearRange(project.StartYear, project.EndYear);

  return (
    <Reveal className="grid grid-cols-1 items-start gap-[1.9rem] border-t border-line py-7 last:border-b tile:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      {shots.length > 0 ? <ProjectGallery shots={shots} title={project.Title} /> : null}

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h3 className="m-0 min-w-0 font-display text-[clamp(1.3rem,2.4vw,1.65rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
            {project.Title}
          </h3>
          <span className="rounded-full border border-accent bg-accent px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium whitespace-nowrap text-accent-ink">
            {project.Category}
          </span>
          {years ? <span className="ml-auto text-[0.78rem] font-medium text-ink-3">{years}</span> : null}
        </div>

        <p className="mb-4 max-w-[64ch] text-[1rem] leading-[1.75] text-ink-2">{project.Description}</p>

        <TagList tags={tags} className="mb-4" />

        {links.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {links.map((link) => (
              <LinkOut key={link.id} link={link} />
            ))}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
