import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, FileText, Images, Layers, Sparkles, GitCompareArrows } from "lucide-react";
import { getProjectSummary } from "@/services/projects";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionTitle, EmptyState } from "@/components/layout/PageHeader";
import { MediaThumb } from "@/components/media/MediaThumb";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { ProjectTimeline } from "@/components/timeline/ProjectTimeline";
import { ComparisonSlider } from "@/components/comparison/ComparisonSlider";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/utils";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProjectSummary(id);
  if (!data) notFound();
  const { project, media, timeline, comparisons, summary } = data;
  const recent = [...media].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)).slice(0, 4);
  const cmp = comparisons[0];
  const before = cmp && media.find((m) => m.id === cmp.beforeAssetId);
  const after = cmp && media.find((m) => m.id === cmp.afterAssetId);
  const base = `/projects/${project.id}`;

  return (
    <div className="space-y-10">
      <section aria-label="Project statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={String(project.stats.mediaAssets)} label="Media Assets" icon={<Images />} />
        <StatCard value={`${project.stats.analyzedPercent}%`} label="AI Analyzed" icon={<Sparkles />} />
        <StatCard value={String(project.stats.focusActivityAssets)} label={`${project.focusActivity} Assets`} icon={<Activity />} />
        <StatCard value={String(project.stats.phases)} label="Project Phases" icon={<Layers />} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <section className="rounded-2xl border bg-surface p-6">
          <SectionTitle title="Project summary" />
          <p className="text-[15px] leading-relaxed text-muted-foreground">{project.description}</p>
          <div className="mt-5 flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-primary">AI summary</p>
              <p className="mt-1 text-[15px] leading-relaxed">{summary.summary}</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border bg-surface p-6">
          <SectionTitle title="AI insights" />
          <ul className="space-y-3">
            {summary.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {h}</li>
            ))}
            {cmp && <li className="flex items-start gap-3 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {cmp.observations[0]} ({cmp.title})</li>}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" asChild><Link href={`${base}/search`}><Sparkles /> Ask AI Search</Link></Button>
            <Button variant="secondary" size="sm" asChild><Link href={`${base}/report`}><FileText /> Impact report</Link></Button>
          </div>
        </section>
      </div>

      <section>
        <SectionTitle title="Recent media" action={<Button variant="ghost" size="sm" asChild><Link href={`${base}/media`}>Open media intelligence</Link></Button>} />
        {recent.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((a) => (
              <li key={a.id}>
                <Link href={`${base}/media`} className="block rounded-2xl border bg-surface p-2 transition-colors hover:border-primary/40">
                  <MediaThumb asset={a} width={480} sizes="(min-width: 1024px) 22vw, 50vw" />
                  <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-2.5">
                    <span className="truncate text-sm font-medium">{a.filename}</span>
                    <PhaseBadge phase={a.phase} />
                  </div>
                  <p className="px-1.5 pb-1 text-xs text-muted-foreground">{formatShortDate(a.capturedAt)}, {a.site ?? a.location}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Images className="h-5 w-5" />}
            title={project.stats.mediaAssets ? "No featured media in this workspace" : "No media yet"}
            description={project.stats.mediaAssets ? "This project's field media hasn't been added to the demo workspace. Use Upload Media to add photos and videos for AI analysis." : "Use Upload Media to add field photos and videos. AI analysis runs automatically."}
          />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle title="Timeline" action={<Button variant="ghost" size="sm" asChild><Link href={`${base}/timeline`}>Full timeline</Link></Button>} />
          {timeline.length ? <ProjectTimeline events={timeline} assets={media} compact /> : <EmptyState icon={<Layers className="h-5 w-5" />} title="No timeline yet" description="Timeline stages appear as analyzed media accumulates across project phases." />}
        </section>
        <section>
          <SectionTitle title="Before / after preview" action={cmp ? <Button variant="ghost" size="sm" asChild><Link href={`${base}/comparison`}>Open comparison</Link></Button> : undefined} />
          {cmp && before && after ? (
            <div className="rounded-2xl border bg-surface p-3">
              <ComparisonSlider before={before} after={after} />
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                <p className="text-sm font-medium">{cmp.title}</p>
                <span className="text-sm font-semibold text-primary">{cmp.confidence}% confidence</span>
              </div>
              <p className="px-2 pb-2 text-sm text-muted-foreground">{cmp.summary}</p>
            </div>
          ) : (
            <EmptyState icon={<GitCompareArrows className="h-5 w-5" />} title="No comparison yet" description="Upload before and after media from the same viewpoint to compare them with AI." />
          )}
        </section>
      </div>
    </div>
  );
}
