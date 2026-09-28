import type { Comparison, MediaAsset, Project, Report, ReportEvidence, TimelineEvent, AIProviderName } from "@/types";
import { uniq } from "@/lib/utils";

export interface ReportNarrativeParts {
  overview: string;
  summary: string;
  methodology: string;
  keyActivities: { name: string; description: string; assetCount: number }[];
  observedChanges: string[];
  evidence: ReportEvidence[];
}

export const DEFAULT_METHODOLOGY =
  "Findings in this report are AI-observed visual changes derived from field photographs and video. Each statement is linked to its source media asset. Visual observations describe what is visible in the frame; they are not laboratory measurements and should be read alongside verified field data where available.";

export function newReportId(projectId: string) {
  return `rpt_${projectId}_${Date.now().toString(36)}`;
}

/** Combines provider-written narrative with structured project evidence. */
export function assembleReport(args: {
  project: Project;
  assets: MediaAsset[];
  timeline: TimelineEvent[];
  comparison: Comparison | null;
  narrative: ReportNarrativeParts;
  provider: AIProviderName;
  id?: string;
}): Report {
  const known = new Set(args.assets.map((a) => a.id));
  const evidence = args.narrative.evidence.filter((e) => known.has(e.assetId));
  const sourceAssetIds = uniq([
    ...evidence.map((e) => e.assetId),
    ...(args.comparison ? [args.comparison.beforeAssetId, args.comparison.afterAssetId] : []),
    ...args.timeline.flatMap((t) => t.assetIds),
  ]).filter((id) => known.has(id));

  return {
    id: args.id ?? newReportId(args.project.id),
    projectId: args.project.id,
    title: `${args.project.name} Impact Report`,
    summary: args.narrative.summary,
    generatedAt: new Date().toISOString(),
    provider: args.provider,
    overview: args.narrative.overview,
    keyActivities: args.narrative.keyActivities,
    timeline: args.timeline,
    evidence,
    comparison: args.comparison,
    observedChanges: args.narrative.observedChanges,
    methodology: args.narrative.methodology || DEFAULT_METHODOLOGY,
    sourceAssetIds,
  };
}

export function countActivityAssets(assets: MediaAsset[], match: string[]) {
  const m = match.map((x) => x.toLowerCase());
  return assets.filter((a) => a.activities.some((act) => m.includes(act.toLowerCase()))).length;
}
