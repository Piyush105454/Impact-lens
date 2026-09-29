import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, FileText, FolderKanban, Images, Plus, Sparkles } from "lucide-react";
import { getDashboard, listFeaturedProjects } from "@/services/projects";
import { StatCard } from "@/components/dashboard/StatCard";
import { MediaActivityChart, ProjectProgressChart } from "@/components/dashboard/Charts";
import { AIActivityFeed } from "@/components/dashboard/AIActivityFeed";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionTitle } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DEMO_USER } from "@/lib/config";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [{ stats, activity, reports, mediaActivity, progress }, featured] = await Promise.all([getDashboard(), listFeaturedProjects()]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-[2.4rem]">{greeting()}, {DEMO_USER.firstName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Monitor your projects, evidence and impact insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild><Link href="/search"><Sparkles /> AI Search</Link></Button>
          <Button asChild><Link href="/projects/new"><Plus /> New project</Link></Button>
        </div>
      </div>

      <section aria-label="Workspace statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={String(stats.projects)} label="Projects" hint="Across 3 districts in Madhya Pradesh" icon={<FolderKanban />} />
        <StatCard value={String(stats.mediaAssets)} label="Media Assets" hint="Photos and videos from the field" icon={<Images />} />
        <StatCard value={`${stats.analyzedPercent}%`} label="AI Analyzed" hint="Tagged with objects, activities and phase" icon={<Sparkles />} />
        <StatCard value={String(stats.reportsGenerated)} label="Reports Generated" hint="Impact reports with traceable evidence" icon={<FileText />} />
      </section>

      <section>
        <SectionTitle title="Recent projects" action={<Button variant="ghost" size="sm" asChild><Link href="/projects">All projects</Link></Button>} />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <section className="rounded-2xl border bg-surface p-5">
          <SectionTitle title="Media activity" description="Assets uploaded and analyzed per month, 2026" />
          <MediaActivityChart data={mediaActivity} />
          <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-phase-during" /> Uploaded</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> AI analyzed</span>
          </div>
        </section>
        <section className="rounded-2xl border bg-surface p-5">
          <SectionTitle title="AI activity" description="Latest analyses, comparisons and reports" />
          <AIActivityFeed items={activity} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <section className="rounded-2xl border bg-surface p-5">
          <SectionTitle title="Project progress" description="Share of each project's media analyzed by AI" />
          <ProjectProgressChart data={progress} />
        </section>
        <section className="rounded-2xl border bg-surface p-5">
          <SectionTitle title="Recent reports" action={<Button variant="ghost" size="sm" asChild><Link href="/reports">View all</Link></Button>} />
          <ul className="space-y-1">
            {reports.map((r) => (
              <li key={r.id}>
                <Link href={`/projects/${r.projectId}/report?id=${r.id}`} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-accent">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-muted-foreground"><BarChart3 className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.projectName}, {r.assetCount} source assets</span>
                  </span>
                  <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{formatDateTime(r.generatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
