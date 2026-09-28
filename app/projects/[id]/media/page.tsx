import { notFound } from "next/navigation";
import { getProject } from "@/services/projects";
import { listProjectMedia } from "@/services/media";
import { ProjectMediaWorkspace } from "@/components/media/ProjectMediaWorkspace";

export default async function ProjectMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const media = await listProjectMedia(id);
  return <ProjectMediaWorkspace projectId={project.id} projectName={project.name} initialAssets={media} totalCount={Math.max(project.stats.mediaAssets, media.length)} />;
}
