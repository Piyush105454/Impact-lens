import { notFound } from "next/navigation";
import { getProjectBundle } from "@/services/projects";
import { ComparisonExperience } from "@/components/comparison/ComparisonExperience";

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getProjectBundle(id);
  if (!b) notFound();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Before / after comparison</h2>
        <p className="mt-1 text-sm text-muted-foreground">AI-observed visual changes between media captured from matched viewpoints. Drag the slider or use arrow keys.</p>
      </div>
      <ComparisonExperience projectId={b.project.id} comparisons={b.comparisons} assets={b.media} />
    </div>
  );
}
