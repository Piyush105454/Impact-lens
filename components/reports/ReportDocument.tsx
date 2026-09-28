import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { MediaAsset, Project, Report } from "@/types";
import { LogoMark } from "@/components/layout/Logo";
import { PhaseBadge } from "@/components/media/PhaseBadge";
import { MediaThumb } from "@/components/media/MediaThumb";
import { assetSrc } from "@/lib/media-url";
import { DEMO_ORG_NAME } from "@/lib/demo/demoProjects";
import { formatDate, formatDateTime, formatMonth, formatPeriod, formatShortDate, titleCase } from "@/lib/utils";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/70 px-6 py-8 sm:px-10" aria-labelledby={`rs-${n}`}>
      <h2 id={`rs-${n}`} className="mb-4 flex items-baseline gap-3 text-xl font-semibold">
        <span className="font-sans text-sm font-medium tabular-nums text-primary">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** On-screen impact report. Mirrors the sections of the PDF export. */
export function ReportDocument({ report, project, assets }: { report: Report; project: Project; assets: MediaAsset[] }) {
  const byId = new Map(assets.map((a) => [a.id, a]));
  const sources = report.sourceAssetIds.map((id) => byId.get(id)).filter((a): a is MediaAsset => Boolean(a));
  const before = report.comparison ? byId.get(report.comparison.beforeAssetId) : undefined;
  const after = report.comparison ? byId.get(report.comparison.afterAssetId) : undefined;
  const phases = new Set(sources.map((a) => a.phase));
  const avgConfidence = sources.length ? Math.round(sources.reduce((s, a) => s + a.confidence, 0) / sources.length) : 0;

  return (
    <article className="overflow-hidden rounded-3xl border bg-surface">
      <header className="relative overflow-hidden px-6 pb-10 pt-8 sm:px-10">
        <div className="absolute inset-0 field-grid opacity-40" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold"><LogoMark className="h-6 w-6" /> ImpactLens Impact Report</span>
            <span className="text-xs text-muted-foreground">Report {report.id}</span>
          </div>
          <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl">{project.name}</h1>
          <p className="mt-3 text-muted-foreground">
            {project.location}, {formatPeriod(project.startDate, project.endDate)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Prepared for {DEMO_ORG_NAME}, generated {formatDateTime(report.generatedAt)}</p>
        </div>
      </header>

      <Section n={1} title="Project overview">
        <p className="max-w-3xl text-[15px] leading-relaxed">{report.overview}</p>
      </Section>

      <Section n={2} title="Project details">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Project type", project.type],
            ["Location", project.location],
            ["Project period", formatPeriod(project.startDate, project.endDate)],
            ["Status", titleCase(project.status)],
            ["Media assets", String(project.stats.mediaAssets)],
            ["AI analyzed", `${project.stats.analyzedPercent}%`],
            [`${project.focusActivity} assets`, String(project.stats.focusActivityAssets)],
            ["Project phases", String(project.stats.phases)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section n={3} title="Key activities">
        <ul className="grid gap-3 md:grid-cols-2">
          {report.keyActivities.map((k) => (
            <li key={k.name} className="rounded-xl border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-sans text-[15px] font-semibold">{k.name}</h3>
                <span className="text-xs text-muted-foreground">{k.assetCount} assets</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{k.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section n={4} title="Timeline">
        <ol className="space-y-4">
          {report.timeline.map((t) => (
            <li key={t.id} className="grid gap-2 sm:grid-cols-[140px,1fr]">
              <p className="text-sm font-semibold">{formatMonth(t.date)}</p>
              <div>
                <p className="flex flex-wrap items-center gap-2 font-medium">{t.title} <PhaseBadge phase={t.phase} /> <span className="text-xs text-muted-foreground">{t.mediaCount} media</span></p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.aiSummary}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section n={5} title="Visual evidence">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.evidence.map((e) => {
            const a = byId.get(e.assetId);
            if (!a) return null;
            return (
              <li key={e.assetId}>
                <figure>
                  <MediaThumb asset={a} width={640} sizes="(min-width: 1024px) 30vw, 50vw" />
                  <figcaption className="mt-2 text-sm leading-snug">{e.caption}</figcaption>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{a.cloudinaryPublicId}</p>
                </figure>
              </li>
            );
          })}
        </ul>
      </Section>

      {report.comparison && before && after && (
        <Section n={6} title="Before & after">
          <div className="grid gap-4 md:grid-cols-2">
            {[before, after].map((a, i) => (
              <figure key={a.id}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-black">
                  <Image src={assetSrc(a, { width: 1000, poster: true })} alt={a.description} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 flex items-center justify-between text-sm">
                  <span className={i === 0 ? "font-semibold text-phase-before" : "font-semibold text-phase-after"}>{i === 0 ? "Before" : "After"}</span>
                  <span className="text-muted-foreground">{formatDate(a.capturedAt)}, {a.site ?? a.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section n={7} title="AI observed changes">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {report.observedChanges.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {o}</li>
          ))}
        </ul>
        {report.comparison && <p className="mt-4 text-sm text-muted-foreground">AI confidence {report.comparison.confidence}% for the primary matched viewpoint. These are AI-observed visual changes, not environmental measurements.</p>}
      </Section>

      <Section n={8} title="AI summary">
        <div className="flex gap-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p className="font-display text-lg leading-relaxed" style={{ fontVariationSettings: '"opsz" 24' }}>{report.summary}</p>
        </div>
      </Section>

      <Section n={9} title="Source assets">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-medium">Cloudinary public ID</th>
                <th scope="col" className="py-2 pr-4 font-medium">Filename</th>
                <th scope="col" className="py-2 pr-4 font-medium">Captured</th>
                <th scope="col" className="py-2 pr-4 font-medium">Location</th>
                <th scope="col" className="py-2 pr-4 font-medium">Phase</th>
                <th scope="col" className="py-2 text-right font-medium">AI confidence</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-4"><code className="text-xs">{a.cloudinaryPublicId}</code></td>
                  <td className="py-2.5 pr-4">{a.filename}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">{formatShortDate(a.capturedAt)}</td>
                  <td className="py-2.5 pr-4">{a.site ?? a.location}</td>
                  <td className="py-2.5 pr-4"><PhaseBadge phase={a.phase} /></td>
                  <td className="py-2.5 text-right tabular-nums">{a.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={10} title="Evidence metadata">
        <dl className="mb-5 grid gap-4 sm:grid-cols-4">
          {[
            ["Source assets referenced", String(sources.length)],
            ["Phases covered", String(phases.size)],
            ["Average AI confidence", `${avgConfidence}%`],
            ["Generated", formatDateTime(report.generatedAt)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-background/40 p-3.5">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{report.methodology}</p>
      </Section>

      <footer className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground sm:px-10">
        <span>Generated by ImpactLens</span>
        <span>{report.id}</span>
      </footer>
    </article>
  );
}
