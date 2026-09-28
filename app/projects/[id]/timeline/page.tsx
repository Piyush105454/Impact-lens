import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { getProjectBundle } from "@/services/projects";
import { ProjectTimeline } from "@/components/timeline/ProjectTimeline";
import { EmptyState } from "@/components/layout/PageHeader";

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getProjectBundle(id);
  if (!b) notFound();
  const total = b.timeline.reduce((s, t) => s + t.mediaCount, 0);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Project timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">{b.timeline.length} stages built by AI from {total} dated media assets. Select a thumbnail to see its analysis.</p>
      </div>
      {b.timeline.length ? <ProjectTimeline events={b.timeline} assets={b.media} /> : <EmptyState icon={<Layers className="h-5 w-5" />} title="No timeline stages yet" description="Upload dated media across project phases and AI will group it into timeline stages." />}
    </div>
  );
}
