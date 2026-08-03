import { getProjects } from "../service";
import { ProjectCard } from "./project-card";
import type { SectionBlock } from "@/types/components";

export async function ProjectsSection({ section }: { section: SectionBlock }) {
  const selected = (section.Projects ?? []).map((project) => project.documentId);
  const projects = await getProjects(section.ShowAll ? undefined : selected);

  return (
    <div>
      {projects.map((project) => (
        <ProjectCard key={project.documentId} project={project} />
      ))}
    </div>
  );
}
