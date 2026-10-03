"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, FileText, History, Printer, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset, Project, Report, ReportListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { REPORT_STEPS, StepList } from "@/components/ai/StepList";
import { useStepSequence } from "@/hooks/useStepSequence";
import { api } from "@/lib/client-api";
import { formatDateTime } from "@/lib/utils";
import { ReportDocument } from "./ReportDocument";

const SECTIONS = ["Project overview", "Project details", "Key activities", "Timeline", "Visual evidence", "Before & after", "AI observed changes", "AI summary", "Source assets", "Evidence metadata"];

export function ReportGenerator({ project, assets, initialReport, history }: { project: Project; assets: MediaAsset[]; initialReport: Report | null; history: ReportListItem[] }) {
  const [report, setReport] = useState<Report | null>(initialReport);
  const steps = useStepSequence(REPORT_STEPS.length, 560);

  async function generate() {
    setReport(null);
    try {
      const r = await steps.run(() => api<Report>("/api/ai/report", { json: { projectId: project.id } }));
      setReport(r);
      toast.success("Impact report generated", { description: `${r.sourceAssetIds.length} source assets referenced` });
      window.history.replaceState(null, "", `?id=${r.id}`);
    } catch (e) {
      toast.error("Report generation failed", { description: e instanceof Error ? e.message : "Try again in a moment." });
    } finally {
      steps.reset();
    }
  }

  if (steps.running) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border bg-surface p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Sparkles className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-semibold">Generating impact report</h2>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <StepList steps={REPORT_STEPS} active={steps.active} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="relative overflow-hidden rounded-3xl border bg-surface p-8">
          <div className="absolute inset-0 field-grid opacity-30" aria-hidden="true" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"><FileText className="h-5 w-5" /></span>
            <h2 className="mt-5 text-3xl font-semibold">Impact report for {project.name}</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              AI reviews the project&apos;s analyzed media, timeline and before/after comparisons, then writes a report where every statement links back to its source asset.
            </p>
            <Button size="lg" className="mt-7" onClick={generate} disabled={!assets.length}><Sparkles /> Generate Impact Report</Button>
            {!assets.length && <p className="mt-3 text-sm text-muted-foreground">Upload and analyze media for this project before generating a report.</p>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border bg-surface p-6">
            <h3 className="text-base font-semibold">Report sections</h3>
            <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {SECTIONS.map((s, i) => <li key={s}><span className="mr-1.5 tabular-nums text-primary">{i + 1}.</span>{s}</li>)}
            </ol>
          </div>
          {history.length > 0 && (
            <div className="rounded-3xl border bg-surface p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold"><History className="h-4 w-4 text-muted-foreground" /> Previous reports</h3>
              <ul className="mt-3 space-y-2">
                {history.slice(0, 4).map((h) => (
                  <li key={h.id}>
                    <Link href={`?id=${h.id}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-accent">
                      <span className="truncate">{h.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(h.generatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{report.title}</p>
          <p className="text-xs text-muted-foreground">Generated {formatDateTime(report.generatedAt)}, {report.sourceAssetIds.length} source assets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={generate}><RefreshCw className="h-4 w-4" /> Regenerate</Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button asChild>
            <a href={`/api/reports/${report.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> Export PDF
            </a>
          </Button>
        </div>
      </div>
      <ReportDocument report={report} project={project} assets={assets} />
    </div>
  );
}
