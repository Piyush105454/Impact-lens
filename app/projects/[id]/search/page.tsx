import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject } from "@/services/projects";
import { SearchExperience } from "@/components/search/SearchExperience";
import { exampleQueries } from "@/lib/demo/demoSearch";

export default async function SearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return (
    <div>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-3xl font-semibold">AI Search</h2>
        <p className="mt-2 text-muted-foreground">Ask in plain language. AI interprets activities, objects, phases, places and dates, then finds matching evidence in {project.name}.</p>
      </div>
      <Suspense>
        <SearchExperience projectId={project.id} projectName={project.name} examples={exampleQueries} />
      </Suspense>
    </div>
  );
}
