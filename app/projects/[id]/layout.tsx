import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarRange, ChevronRight, MapPin } from "lucide-react";
import { getProject } from "@/services/projects";
import { listProjectMedia } from "@/services/media";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { ProjectHeaderActions } from "@/components/projects/ProjectHeaderActions";
import { Badge } from "@/components/ui/badge";
import { formatMonth } from "@/lib/utils";

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProject(id);
  return { title: p?.name ?? "Project" };
}

export default async function ProjectLayout({ children, params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const media = await listProjectMedia(id);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground">Projects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{project.name}</span>
      </nav>
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-3">{project.type}</Badge>
          <h1 className="text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.1]">{project.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {project.location}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarRange className="h-4 w-4" /> {formatMonth(project.startDate)} — {formatMonth(project.endDate)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ProjectHeaderActions projectId={project.id} projectName={project.name} sampleAssets={media} />
        </div>
      </div>
      <ProjectTabs projectId={project.id} />
      <div className="pt-8">{children}</div>
    </div>
  );
}
