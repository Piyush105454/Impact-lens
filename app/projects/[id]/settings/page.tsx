import { notFound } from "next/navigation";
import { getProject } from "@/services/projects";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <ProjectSettingsForm project={project} />;
}
