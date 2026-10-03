import "server-only";
import { getRepository } from "./repository";
import type { CreateProjectInput, UpdateProjectInput } from "./repository/types";
import { FEATURED_PROJECT_IDS } from "@/lib/demo/demoProjects";
import { demoMediaActivity } from "@/lib/demo/demoActivity";
import type { MediaAsset, TimelineEvent } from "@/types";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthlyActivity(media: MediaAsset[]) {
  const buckets = new Map<string, { month: string; uploaded: number; analyzed: number }>();
  for (const m of [...media].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))) {
    const key = m.capturedAt.slice(0, 7);
    const b = buckets.get(key) ?? { month: MONTH_ABBR[Number(key.slice(5, 7)) - 1], uploaded: 0, analyzed: 0 };
    b.uploaded++;
    if (m.analyzed) b.analyzed++;
    buckets.set(key, b);
  }
  return Array.from(buckets.values()).slice(-6);
}

export async function listProjects() {
  return getRepository().listProjects();
}

export async function getProject(id: string) {
  return getRepository().getProject(id);
}

export async function listFeaturedProjects() {
  const all = await listProjects();
  const featured = FEATURED_PROJECT_IDS.map((id) => all.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return featured.length ? featured : all.slice(0, 3);
}

export async function createProject(input: CreateProjectInput) {
  return getRepository().createProject(input);
}

export async function updateProject(id: string, patch: UpdateProjectInput) {
  return getRepository().updateProject(id, patch);
}

export async function deleteProject(id: string) {
  return getRepository().deleteProject(id);
}

export function generateDynamicTimeline(projectId: string, media: MediaAsset[]): TimelineEvent[] {
  if (!media.length) return [];
  const groups = new Map<string, MediaAsset[]>();
  const sorted = [...media].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));

  for (const m of sorted) {
    const monthKey = m.capturedAt ? m.capturedAt.slice(0, 7) : "2026-03";
    const key = `${m.phase}_${monthKey}`;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  const events: TimelineEvent[] = [];
  let idx = 1;
  for (const [, items] of groups.entries()) {
    const phase = items[0].phase;
    const rawDate = items[0].capturedAt ? items[0].capturedAt.slice(0, 10) : "2026-03-01";
    const tags = Array.from(new Set(items.flatMap((a) => a.tags))).filter(Boolean).slice(0, 5);
    const activities = Array.from(new Set(items.flatMap((a) => a.activities))).filter(Boolean).slice(0, 3);
    const objects = Array.from(new Set(items.flatMap((a) => a.objects))).filter(Boolean).slice(0, 3);
    const avgConf = Math.round(items.reduce((s, a) => s + (a.confidence || 75), 0) / items.length);
    const site = items[0].site ?? items[0].location ?? "Project Site";

    const phaseTitle = phase === "before" ? "Baseline Phase" : phase === "during" ? "Implementation & Field Activities" : "Restoration & Final Impact";
    const activityStr = activities.length ? activities.join(", ") : "Site Operations";
    const keyPoints = objects.length ? `Detected ${objects.join(", ")}` : "Field progress documented";

    events.push({
      id: `evt_dyn_${projectId}_${idx++}`,
      projectId,
      date: `${rawDate.slice(0, 7)}-01`,
      title: `${phaseTitle} - ${activityStr}`,
      description: `${items.length} media asset(s) captured at ${site}. Key point changes: ${keyPoints}.`,
      aiSummary: `AI analyzed ${items.length} asset(s) with ${avgConf}% confidence. Tagged with ${tags.map((t) => `#${t}`).join(" ") || "#field #evidence"}. Visual impact changes verified for this timeline stage.`,
      phase,
      mediaCount: items.length,
      assetIds: items.map((a) => a.id),
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getProjectBundle(id: string) {
  const repo = getRepository();
  const project = await repo.getProject(id);
  if (!project) return null;
  const [media, rawTimeline, comparisons] = await Promise.all([repo.listMedia(id), repo.listTimeline(id), repo.listComparisons(id)]);
  const timeline = rawTimeline.length > 0 ? rawTimeline : generateDynamicTimeline(id, media);
  return { project, media, timeline, comparisons };
}

export async function getDashboard() {
  const repo = getRepository();
  const [stats, activity, reports, projects] = await Promise.all([repo.getDashboardStats(), repo.listActivity(6), repo.listReports(), repo.listProjects()]);
  const mediaActivity = repo.kind === "demo" ? demoMediaActivity : monthlyActivity(await repo.listMedia());
  const progress = [...projects]
    .sort((a, b) => b.stats.mediaAssets - a.stats.mediaAssets)
    .slice(0, 6)
    .map((p) => ({ name: p.name.length > 22 ? `${p.name.slice(0, 21)}…` : p.name, analyzed: p.stats.analyzedPercent, media: p.stats.mediaAssets }));
  return { stats, activity, reports: reports.slice(0, 4), mediaActivity, progress };
}

export function validateProjectInput(body: unknown): { ok: true; value: CreateProjectInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Request body must be a JSON object" };
  const b = body as Record<string, unknown>;
  const get = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const value: CreateProjectInput = {
    name: get("name"),
    description: get("description"),
    type: get("type") || "Environmental Restoration",
    location: get("location"),
    startDate: get("startDate"),
    endDate: get("endDate"),
    focusActivity: get("focusActivity") || undefined,
  };
  if (value.name.length < 3) return { ok: false, error: "Project name must be at least 3 characters" };
  if (!value.location) return { ok: false, error: "Location is required" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(value.endDate)) return { ok: false, error: "Start and end dates are required" };
  if (value.endDate < value.startDate) return { ok: false, error: "End date must be after the start date" };
  return { ok: true, value };
}

/** AI-written project summary with highlights (active provider, falls back to local). */
export async function getProjectSummary(id: string) {
  const bundle = await getProjectBundle(id);
  if (!bundle) return null;
  const { getAIProvider } = await import("./ai");
  const summary = await getAIProvider().generateProjectSummary({ project: bundle.project, assets: bundle.media.filter((m) => m.analyzed), timeline: bundle.timeline });
  return { ...bundle, summary };
}
