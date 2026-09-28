import "server-only";
import type { AIActivityItem, Comparison, MediaAnalysis, MediaAsset, Phase, Project, Report, ReportListItem, SearchInterpretation, TimelineEvent } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateMediaInput, CreateProjectInput, Repository, UpdateProjectInput } from "./types";

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const arr = (v: unknown) => (Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : []);

function toProject(r: Row, stats?: Partial<Project["stats"]>): Project {
  return {
    id: s(r.id),
    organizationId: s(r.organization_id),
    name: s(r.name),
    description: s(r.description),
    type: s(r.type),
    location: s(r.location),
    startDate: s(r.start_date),
    endDate: s(r.end_date),
    status: (s(r.status) || "active") as Project["status"],
    coverUrl: s(r.cover_url),
    createdAt: s(r.created_at),
    focusActivity: s(r.focus_activity) || "Field Activity",
    stats: { mediaAssets: 0, analyzedPercent: 0, focusActivityAssets: 0, phases: 0, reports: 0, ...stats },
  };
}

function toMedia(r: Row): MediaAsset {
  const analyses = Array.isArray(r.media_analysis) ? (r.media_analysis as Row[]) : [];
  const a = analyses.sort((x, y) => s(y.created_at).localeCompare(s(x.created_at)))[0];
  return {
    id: s(r.id),
    projectId: s(r.project_id),
    filename: s(r.filename),
    cloudinaryPublicId: s(r.cloudinary_public_id),
    cloudinaryUrl: s(r.cloudinary_url),
    resourceType: s(r.resource_type) === "video" ? "video" : "image",
    format: s(r.format),
    width: n(r.width),
    height: n(r.height),
    duration: r.duration == null ? null : n(r.duration),
    phase: (s(r.phase) || "during") as Phase,
    capturedAt: s(r.captured_at) || s(r.created_at),
    location: s(r.location),
    site: s(r.site) || undefined,
    tags: a ? arr(a.tags) : [],
    objects: a ? arr(a.detected_objects) : [],
    activities: a ? arr(a.detected_activities) : [],
    description: a ? s(a.description) : "",
    confidence: a ? n(a.confidence) : 0,
    analyzed: Boolean(a),
    analyzedAt: a ? s(a.created_at) : undefined,
    source: "cloudinary",
  };
}

/** Supabase-backed repository. All queries run as the signed-in user under RLS. */
export class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;
  private db = createSupabaseServerClient;

  async listProjects() {
    const db = await this.db();
    const { data, error } = await db.from("projects").select("*, media_assets(count), reports(count)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Row) =>
      toProject(r, {
        mediaAssets: n((r.media_assets as Row[] | undefined)?.[0]?.count),
        reports: n((r.reports as Row[] | undefined)?.[0]?.count),
      }),
    );
  }
  async getProject(id: string) {
    const db = await this.db();
    const { data, error } = await db.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const media = await this.listMedia(id);
    const analyzed = media.filter((m) => m.analyzed).length;
    return toProject(data, {
      mediaAssets: media.length,
      analyzedPercent: media.length ? Math.round((analyzed / media.length) * 100) : 0,
      phases: new Set(media.map((m) => m.phase)).size,
    });
  }
  async createProject(input: CreateProjectInput) {
    const db = await this.db();
    const { data: org } = await db.from("organization_members").select("organization_id").limit(1).maybeSingle();
    const { data, error } = await db
      .from("projects")
      .insert({ organization_id: org?.organization_id, name: input.name, description: input.description, type: input.type, location: input.location, start_date: input.startDate, end_date: input.endDate, focus_activity: input.focusActivity, status: "active" })
      .select("*")
      .single();
    if (error) throw error;
    return toProject(data);
  }
  async updateProject(id: string, patch: UpdateProjectInput) {
    const db = await this.db();
    const { data, error } = await db
      .from("projects")
      .update({ name: patch.name, description: patch.description, type: patch.type, location: patch.location, start_date: patch.startDate, end_date: patch.endDate, status: patch.status, focus_activity: patch.focusActivity })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? toProject(data) : null;
  }
  async deleteProject(id: string) {
    const db = await this.db();
    const { error, count } = await db.from("projects").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async listMedia(projectId?: string) {
    const db = await this.db();
    let q = db.from("media_assets").select("*, media_analysis(*)").order("captured_at", { ascending: true });
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(toMedia);
  }
  async getMedia(id: string) {
    const db = await this.db();
    const { data, error } = await db.from("media_assets").select("*, media_analysis(*)").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toMedia(data) : null;
  }
  async createMedia(i: CreateMediaInput) {
    const db = await this.db();
    const { data, error } = await db
      .from("media_assets")
      .insert({ project_id: i.projectId, cloudinary_public_id: i.cloudinaryPublicId, cloudinary_url: i.cloudinaryUrl, resource_type: i.resourceType, filename: i.filename, format: i.format, width: i.width, height: i.height, duration: i.duration, phase: i.phase, captured_at: i.capturedAt, location: i.location, site: i.site })
      .select("*")
      .single();
    if (error) throw error;
    return toMedia(data);
  }
  async saveAnalysis(assetId: string, a: MediaAnalysis) {
    const db = await this.db();
    const { error } = await db.from("media_analysis").insert({ media_asset_id: assetId, description: a.description, tags: a.tags, detected_objects: a.objects, detected_activities: a.activities, confidence: a.confidence, ai_provider: a.provider ?? "demo" });
    if (error) throw error;
    if (a.phase) await db.from("media_assets").update({ phase: a.phase }).eq("id", assetId);
    return this.getMedia(assetId);
  }

  async listTimeline(projectId: string) {
    const db = await this.db();
    const { data, error } = await db.from("project_timeline").select("*").eq("project_id", projectId).order("date");
    if (error) throw error;
    return (data ?? []).map(
      (r: Row): TimelineEvent => ({ id: s(r.id), projectId, date: s(r.date), title: s(r.title), description: s(r.description), aiSummary: s(r.ai_summary), phase: (s(r.phase) || "during") as Phase, mediaCount: n(r.media_count), assetIds: arr(r.asset_ids) }),
    );
  }
  async listComparisons(projectId: string) {
    const db = await this.db();
    const { data, error } = await db.from("comparisons").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(
      (r: Row): Comparison => ({ id: s(r.id), projectId, beforeAssetId: s(r.before_asset_id), afterAssetId: s(r.after_asset_id), title: s(r.title), observations: arr(r.ai_observations), confidence: n(r.confidence), summary: s(r.summary) }),
    );
  }
  async saveComparison(c: Comparison) {
    const db = await this.db();
    const { error } = await db.from("comparisons").insert({ project_id: c.projectId, before_asset_id: c.beforeAssetId, after_asset_id: c.afterAssetId, title: c.title, ai_observations: c.observations, confidence: c.confidence, summary: c.summary });
    if (error) throw error;
    return c;
  }

  async saveReport(r: Report) {
    const db = await this.db();
    const { data, error } = await db.from("reports").insert({ project_id: r.projectId, title: r.title, summary: r.summary, content: r }).select("id").single();
    if (error) throw error;
    const saved = { ...r, id: s(data.id) };
    await db.from("report_assets").insert(r.sourceAssetIds.map((id) => ({ report_id: saved.id, media_asset_id: id })));
    return saved;
  }
  async getReport(id: string) {
    const db = await this.db();
    const { data, error } = await db.from("reports").select("id, content").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? ({ ...(data.content as Report), id: s(data.id) } as Report) : null;
  }
  async listReports(projectId?: string) {
    const db = await this.db();
    let q = db.from("reports").select("id, project_id, title, created_at, projects(name), report_assets(count)").order("created_at", { ascending: false });
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(
      (r: Row): ReportListItem => ({ id: s(r.id), projectId: s(r.project_id), projectName: s((r.projects as Row | null)?.name), title: s(r.title), generatedAt: s(r.created_at), assetCount: n((r.report_assets as Row[] | undefined)?.[0]?.count) }),
    );
  }

  async logSearch(projectId: string, query: string, interpretation: SearchInterpretation) {
    const db = await this.db();
    await db.from("search_queries").insert({ project_id: projectId, query, interpreted_query: interpretation });
  }
  async getDashboardStats() {
    const db = await this.db();
    const [p, m, a, r] = await Promise.all([
      db.from("projects").select("id", { count: "exact", head: true }),
      db.from("media_assets").select("id", { count: "exact", head: true }),
      db.from("media_analysis").select("media_asset_id", { count: "exact", head: true }),
      db.from("reports").select("id", { count: "exact", head: true }),
    ]);
    const media = m.count ?? 0;
    return { projects: p.count ?? 0, mediaAssets: media, analyzedPercent: media ? Math.min(100, Math.round(((a.count ?? 0) / media) * 100)) : 0, reportsGenerated: r.count ?? 0 };
  }
  async listActivity(limit = 6): Promise<AIActivityItem[]> {
    const db = await this.db();
    const { data } = await db.from("media_analysis").select("id, description, confidence, created_at, media_assets(id, filename, project_id)").order("created_at", { ascending: false }).limit(limit);
    return (data ?? []).map((r: Row) => {
      const m = (r.media_assets ?? {}) as Row;
      return { id: s(r.id), kind: "analysis", title: `${s(m.filename)} analyzed`, detail: `${s(r.description).slice(0, 70)} ${n(r.confidence)}% confidence`, projectId: s(m.project_id), assetId: s(m.id), at: s(r.created_at) };
    });
  }
}
