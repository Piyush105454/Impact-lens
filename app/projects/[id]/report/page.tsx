import { notFound } from "next/navigation";
import { getProjectBundle } from "@/services/projects";
import { getReport, listReports } from "@/services/reports";
import { ReportGenerator } from "@/components/reports/ReportGenerator";

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ id?: string }> }) {
  const { id } = await params;
  const { id: reportId } = await searchParams;
  const b = await getProjectBundle(id);
  if (!b) notFound();
  const [initial, history] = await Promise.all([reportId ? getReport(reportId) : Promise.resolve(null), listReports(id)]);
  return (
    <ReportGenerator
      key={initial?.id ?? "new"}
      project={b.project}
      assets={b.media}
      initialReport={initial && initial.projectId === id ? initial : null}
      history={history}
    />
  );
}
