export type Phase = "before" | "during" | "after";
export type ResourceType = "image" | "video";
export type ProjectStatus = "active" | "completed" | "planning";
export type AIProviderName = "demo" | "gemini" | "openai" | "openrouter";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: string;
  location: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: ProjectStatus;
  coverAssetId?: string;
  coverUrl: string;
  createdAt: string;
  stats: ProjectStats;
  focusActivity: string; // e.g. "Waste Removal"
}

export interface ProjectStats {
  mediaAssets: number;
  analyzedPercent: number;
  focusActivityAssets: number;
  phases: number;
  reports: number;
}

export interface MediaAnalysis {
  description: string;
  tags: string[];
  objects: string[];
  activities: string[];
  confidence: number; // 0..100
  phase?: Phase;
  location?: string;
  capturedAt?: string;
  provider?: AIProviderName;
  analyzedAt?: string;
}

export interface MediaAsset {
  id: string;
  projectId: string;
  filename: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  resourceType: ResourceType;
  format: string;
  width: number;
  height: number;
  duration: number | null;
  posterUrl?: string;
  phase: Phase;
  capturedAt: string; // ISO datetime
  location: string;
  site?: string;
  tags: string[];
  objects: string[];
  activities: string[];
  description: string;
  confidence: number;
  analyzed: boolean;
  analyzedAt?: string;
  source: "demo" | "cloudinary";
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  date: string; // ISO date (first of month)
  title: string;
  description: string;
  aiSummary: string;
  phase: Phase;
  mediaCount: number;
  assetIds: string[];
}

export interface Comparison {
  id: string;
  projectId: string;
  beforeAssetId: string;
  afterAssetId: string;
  title: string;
  observations: string[];
  confidence: number;
  summary: string;
  provider?: AIProviderName;
}

export interface SearchInterpretation {
  query: string;
  intent: string;
  activities: string[];
  tags: string[];
  phases: Phase[];
  locations: string[];
  mediaType?: ResourceType;
  dateRange?: { from: string; to: string; label: string };
}

export interface SearchResult {
  asset: MediaAsset;
  score: number; // 0..1
  matchedOn: string[];
}

export interface SearchResponse {
  interpretation: SearchInterpretation;
  results: SearchResult[];
  tookMs: number;
  provider: AIProviderName;
}

export interface ReportSection {
  heading: string;
  body: string;
}

export interface ReportEvidence {
  assetId: string;
  caption: string;
}

export interface Report {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  generatedAt: string;
  provider: AIProviderName;
  overview: string;
  keyActivities: { name: string; description: string; assetCount: number }[];
  timeline: TimelineEvent[];
  evidence: ReportEvidence[];
  comparison: Comparison | null;
  observedChanges: string[];
  methodology: string;
  sourceAssetIds: string[];
}

export interface ReportListItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  generatedAt: string;
  assetCount: number;
}

export interface DashboardStats {
  projects: number;
  mediaAssets: number;
  analyzedPercent: number;
  reportsGenerated: number;
}

export interface AIActivityItem {
  id: string;
  kind: "analysis" | "report" | "comparison" | "search";
  title: string;
  detail: string;
  projectId: string;
  at: string;
  assetId?: string;
}

export interface CloudinaryUploadInfo {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  original_filename?: string;
  bytes?: number;
  created_at?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
