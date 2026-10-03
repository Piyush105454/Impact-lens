import type { AIActivityItem, Comparison, MediaAnalysis, MediaAsset, Project, Report, ReportListItem, SearchInterpretation, TimelineEvent } from "@/types";
import { demoDashboardStats, demoProjects, DEMO_ORG_ID } from "@/lib/demo/demoProjects";
import { demoMedia } from "@/lib/demo/demoMedia";
import { demoTimeline } from "@/lib/demo/demoTimeline";
import { demoComparisons } from "@/lib/demo/demoComparisons";
import { demoReportHistory } from "@/lib/demo/demoReports";
import { demoActivity } from "@/lib/demo/demoActivity";
import type { CreateMediaInput, CreateProjectInput, Repository, UpdateProjectInput } from "./types";

interface Store {
  projects: Project[];
  media: MediaAsset[];
  timeline: TimelineEvent[];
  comparisons: Comparison[];
  reports: Map<string, Report>;
  reportHistory: ReportListItem[];
  activity: AIActivityItem[];
  searches: { projectId: string; query: string; at: string }[];
  deletedBase: number;
}

// Survives hot reloads in dev; per-instance in serverless (demo only).
const g = globalThis as unknown as { __impactlensStore?: Store };
function store(): Store {
  if (!g.__impactlensStore) {
    g.__impactlensStore = {
      projects: structuredClone(demoProjects),
      media: structuredClone(demoMedia),
      timeline: structuredClone(demoTimeline),
      comparisons: structuredClone(demoComparisons),
      reports: new Map(),
      reportHistory: structuredClone(demoReportHistory),
      activity: structuredClone(demoActivity),
      searches: [],
      deletedBase: 0,
    };
  }
  return g.__impactlensStore;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "project";
}

const baseMediaIds = new Set(demoMedia.map((m) => m.id));

export class DemoRepository implements Repository {
  readonly kind = "demo" as const;

  async listProjects() {
    return store().projects;
  }
  async getProject(id: string) {
    return store().projects.find((p) => p.id === id) ?? null;
  }
  async createProject(input: CreateProjectInput) {
    const s = store();
    let id = slugify(input.name);
    if (s.projects.some((p) => p.id === id)) id = `${id}-${Date.now().toString(36).slice(-4)}`;
    const project: Project = {
      id,
      organizationId: DEMO_ORG_ID,
      name: input.name,
      description: input.description,
      type: input.type,
      location: input.location,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "active",
      coverUrl: "",
      createdAt: new Date().toISOString(),
      focusActivity: input.focusActivity || "Field Activity",
      stats: { mediaAssets: 0, analyzedPercent: 0, focusActivityAssets: 0, phases: 0, reports: 0 },
    };
    s.projects.unshift(project);
    return project;
  }
  async updateProject(id: string, patch: UpdateProjectInput) {
    const p = store().projects.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
    return p;
  }
  async deleteProject(id: string) {
    const s = store();
    const before = s.projects.length;
    s.projects = s.projects.filter((p) => p.id !== id);
    if (s.projects.length < before && demoProjects.some((p) => p.id === id)) s.deletedBase += 1;
    return s.projects.length < before;
  }

  async listMedia(projectId?: string) {
    const all = store().media;
    const list = projectId ? all.filter((m) => m.projectId === projectId) : all;
    return [...list].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  }
  async getMedia(id: string) {
    return store().media.find((m) => m.id === id) ?? null;
  }
  async createMedia(input: CreateMediaInput) {
    const asset: MediaAsset = {
      tags: [],
      objects: [],
      activities: [],
      description: "",
      confidence: 0,
      ...input,
      id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      analyzed: false,
    };
    const s = store();
    s.media.push(asset);
    const p = s.projects.find((x) => x.id === input.projectId);
    if (p) p.stats.mediaAssets += 1;
    return asset;
  }
  async saveAnalysis(assetId: string, a: MediaAnalysis) {
    const s = store();
    const m = s.media.find((x) => x.id === assetId);
    if (!m) return null;
    const wasAnalyzed = m.analyzed;
    Object.assign(m, {
      description: a.description,
      tags: a.tags,
      objects: a.objects,
      activities: a.activities,
      confidence: a.confidence,
      phase: a.phase ?? m.phase,
      analyzed: true,
      analyzedAt: a.analyzedAt ?? new Date().toISOString(),
    });
    if (!baseMediaIds.has(assetId) && !wasAnalyzed) {
      s.activity.unshift({ id: `act_${Date.now()}`, kind: "analysis", title: `${m.filename} analyzed`, detail: `${a.description.slice(0, 70)}${a.description.length > 70 ? "…" : ""} ${a.confidence}% confidence`, projectId: m.projectId, assetId, at: new Date().toISOString() });
    }
    return m;
  }

  async deleteMedia(id: string) {
    const s = store();
    const len = s.media.length;
    s.media = s.media.filter((m) => m.id !== id);
    return s.media.length < len;
  }

  async listTimeline(projectId: string) {
    return store().timeline.filter((t) => t.projectId === projectId).sort((a, b) => a.date.localeCompare(b.date));
  }
  async listComparisons(projectId: string) {
    return store().comparisons.filter((c) => c.projectId === projectId);
  }
  async saveComparison(c: Comparison) {
    const s = store();
    // Keep curated viewpoint order stable; new comparisons are appended.
    const i = s.comparisons.findIndex((x) => x.id === c.id);
    if (i >= 0) s.comparisons[i] = c;
    else s.comparisons.push(c);
    return c;
  }

  async saveReport(r: Report) {
    const s = store();
    s.reports.set(r.id, r);
    const project = s.projects.find((p) => p.id === r.projectId);
    s.reportHistory.unshift({ id: r.id, projectId: r.projectId, projectName: project?.name ?? r.projectId, title: r.title, generatedAt: r.generatedAt, assetCount: r.sourceAssetIds.length });
    s.activity.unshift({ id: `act_${Date.now()}`, kind: "report", title: "Impact report generated", detail: project?.name ?? r.projectId, projectId: r.projectId, at: r.generatedAt });
    return r;
  }
  async getReport(id: string) {
    return store().reports.get(id) ?? null;
  }
  async listReports(projectId?: string) {
    const h = store().reportHistory;
    return projectId ? h.filter((r) => r.projectId === projectId) : h;
  }

  async logSearch(projectId: string, query: string, _i: SearchInterpretation) {
    store().searches.unshift({ projectId, query, at: new Date().toISOString() });
  }

  async getDashboardStats() {
    const s = store();
    const added = s.media.length - demoMedia.length;
    const newProjects = s.projects.filter((p) => !demoProjects.some((d) => d.id === p.id)).length;
    const newReports = s.reportHistory.length - demoReportHistory.length;
    return {
      projects: demoDashboardStats.projects + newProjects - s.deletedBase,
      mediaAssets: demoDashboardStats.mediaAssets + Math.max(0, added),
      analyzedPercent: demoDashboardStats.analyzedPercent,
      reportsGenerated: demoDashboardStats.reportsGenerated + Math.max(0, newReports),
    };
  }
  async listActivity(limit = 6) {
    return store().activity.slice(0, limit);
  }
}
