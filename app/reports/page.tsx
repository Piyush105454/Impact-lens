import Link from "next/link";
import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { listReports } from "@/services/reports";
import { listFeaturedProjects } from "@/services/projects";
import { EmptyState, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [reports, featured] = await Promise.all([listReports(), listFeaturedProjects()]);
  return (
    <>
      <PageHeader
        title="Impact reports"
        description="AI-generated reports where every statement links back to its source media."
        actions={<Button asChild><Link href={`/projects/${featured[0]?.id ?? ""}/report`}><FileText /> Generate report</Link></Button>}
      />
      {reports.length ? (
        <div className="overflow-hidden rounded-2xl border bg-surface">
          <ul className="divide-y">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <Link href={`/projects/${r.projectId}/report?id=${r.id}`} className="block truncate font-medium hover:text-primary">{r.title}</Link>
                  <p className="truncate text-sm text-muted-foreground">{r.projectName}, {r.assetCount} source assets, {formatDateTime(r.generatedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" asChild><Link href={`/projects/${r.projectId}/report?id=${r.id}`}>Open</Link></Button>
                  <Button variant="ghost" size="sm" asChild><a href={`/api/reports/${r.id}/pdf`} download aria-label={`Download PDF of ${r.title}`}><Download /> PDF</a></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState icon={<FileText className="h-5 w-5" />} title="No reports yet" description="Open a project and generate an impact report from its analyzed media." />
      )}
    </>
  );
}
