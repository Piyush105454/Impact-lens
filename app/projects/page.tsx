import Link from "next/link";
import type { Metadata } from "next";
import { FolderPlus, Plus } from "lucide-react";
import { listProjects } from "@/services/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DEMO_ORG_NAME } from "@/lib/demo/demoProjects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects();
  const active = projects.filter((p) => p.status !== "completed").length;
  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in the ${DEMO_ORG_NAME} workspace, ${active} currently active.`}
        actions={<Button asChild><Link href="/projects/new"><Plus /> New project</Link></Button>}
      />
      {projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      ) : (
        <EmptyState icon={<FolderPlus className="h-5 w-5" />} title="No projects yet" description="Create a project to start organizing field media and AI insights." action={<Button asChild><Link href="/projects/new">Create project</Link></Button>} />
      )}
    </>
  );
}
