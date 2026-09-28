import "server-only";
import type { Report } from "@/types";
import { getRepository } from "./repository";
import { getAIProvider } from "./ai";
import { reportNarratives } from "@/lib/demo/demoReports";

async function buildProjectReport(projectId: string): Promise<Report | null> {
  const repo = getRepository();
  const project = await repo.getProject(projectId);
  if (!project) return null;
  const [assets, timeline, comparisons] = await Promise.all([repo.listMedia(projectId), repo.listTimeline(projectId), repo.listComparisons(projectId)]);
  const preferred = reportNarratives[projectId]?.primaryComparisonId;
  const comparison = comparisons.find((c) => c.id === preferred) ?? comparisons[0] ?? null;
  return getAIProvider().generateReport({ project, assets: assets.filter((a) => a.analyzed), timeline, comparison });
}

export async function generateProjectReport(projectId: string): Promise<Report | null> {
  const report = await buildProjectReport(projectId);
  return report ? getRepository().saveReport(report) : null;
}

/**
 * Loads a report. Demo report ids encode their project (rpt_<projectId>_<suffix>),
 * so a report requested on a different serverless instance is rebuilt on demand.
 */
export async function getReport(id: string): Promise<Report | null> {
  const repo = getRepository();
  const found = await repo.getReport(id);
  if (found) return found;
  if (repo.kind !== "demo") return null;
  const m = /^rpt_([a-z0-9-]+)_[a-z0-9]+$/.exec(id);
  if (!m) return null;
  const regenerated = await buildProjectReport(m[1]);
  return regenerated ? { ...regenerated, id } : null;
}

export async function listReports(projectId?: string) {
  return getRepository().listReports(projectId);
}

export async function reportContext(report: Report) {
  const repo = getRepository();
  const [project, assets] = await Promise.all([repo.getProject(report.projectId), repo.listMedia(report.projectId)]);
  return { project, assets };
}
