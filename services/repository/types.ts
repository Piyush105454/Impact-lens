import type {
  AIActivityItem,
  Comparison,
  DashboardStats,
  MediaAnalysis,
  MediaAsset,
  Project,
  Report,
  ReportListItem,
  SearchInterpretation,
  TimelineEvent,
} from "@/types";

export interface CreateProjectInput {
  name: string;
  description: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  focusActivity?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput & { status: Project["status"] }>;

export type CreateMediaInput = Omit<MediaAsset, "id" | "analyzed" | "tags" | "objects" | "activities" | "description" | "confidence"> &
  Partial<Pick<MediaAsset, "tags" | "objects" | "activities" | "description" | "confidence">>;

/** Storage contract. Implemented by the demo workspace and by Supabase. */
export interface Repository {
  readonly kind: "demo" | "supabase";
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProject(id: string, patch: UpdateProjectInput): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  listMedia(projectId?: string): Promise<MediaAsset[]>;
  getMedia(id: string): Promise<MediaAsset | null>;
  createMedia(input: CreateMediaInput): Promise<MediaAsset>;
  saveAnalysis(assetId: string, analysis: MediaAnalysis): Promise<MediaAsset | null>;
  deleteMedia(id: string): Promise<boolean>;

  listTimeline(projectId: string): Promise<TimelineEvent[]>;
  listComparisons(projectId: string): Promise<Comparison[]>;
  saveComparison(c: Comparison): Promise<Comparison>;

  saveReport(r: Report): Promise<Report>;
  getReport(id: string): Promise<Report | null>;
  listReports(projectId?: string): Promise<ReportListItem[]>;

  logSearch(projectId: string, query: string, interpretation: SearchInterpretation): Promise<void>;
  getDashboardStats(): Promise<DashboardStats>;
  listActivity(limit?: number): Promise<AIActivityItem[]>;
}
