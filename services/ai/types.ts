import type {
  AIProviderName,
  Comparison,
  MediaAnalysis,
  MediaAsset,
  Phase,
  Project,
  Report,
  SearchInterpretation,
  TimelineEvent,
} from "@/types";

export type { MediaAnalysis };

export interface AnalyzeImageInput {
  /** Existing asset id, when analyzing a stored asset. */
  assetId?: string;
  /** Absolute URL of the image (or video poster frame) to analyze. */
  imageUrl: string;
  filename?: string;
  resourceType?: "image" | "video";
  context?: {
    projectName?: string;
    projectType?: string;
    location?: string;
    phase?: Phase;
    capturedAt?: string;
  };
}

export interface CompareImagesInput {
  project: Project;
  before: MediaAsset;
  after: MediaAsset;
  beforeUrl: string;
  afterUrl: string;
}

export interface ProjectSummaryInput {
  project: Project;
  assets: MediaAsset[];
  timeline: TimelineEvent[];
}

export interface ProjectSummary {
  summary: string;
  highlights: string[];
}

export interface GenerateReportInput {
  project: Project;
  assets: MediaAsset[];
  timeline: TimelineEvent[];
  comparison: Comparison | null;
}

export interface InterpretSearchInput {
  query: string;
  project: Project;
  /** Vocabulary present in the project's media, used to ground interpretation. */
  vocabulary: { tags: string[]; activities: string[]; locations: string[] };
}

/**
 * Every AI provider implements this contract and returns normalized types,
 * so API routes and the frontend never depend on a specific vendor.
 */
export interface AIProvider {
  readonly name: AIProviderName;
  analyzeImage(input: AnalyzeImageInput): Promise<MediaAnalysis>;
  compareImages(input: CompareImagesInput): Promise<Comparison>;
  generateProjectSummary(input: ProjectSummaryInput): Promise<ProjectSummary>;
  generateReport(input: GenerateReportInput): Promise<Report>;
  interpretSearchQuery(input: InterpretSearchInput): Promise<SearchInterpretation>;
}

export interface ProviderStatus {
  name: AIProviderName;
  label: string;
  configured: boolean;
  active: boolean;
  model?: string;
  note: string;
}
