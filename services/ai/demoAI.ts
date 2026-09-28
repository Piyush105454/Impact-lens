import type { Comparison, MediaAnalysis, Report, SearchInterpretation } from "@/types";
import { demoAnalysis } from "@/lib/demo/demoAnalysis";
import { demoComparisons } from "@/lib/demo/demoComparisons";
import { reportNarratives } from "@/lib/demo/demoReports";
import { PHASE_LABEL, titleCase, uniq } from "@/lib/utils";
import type {
  AIProvider,
  AnalyzeImageInput,
  CompareImagesInput,
  GenerateReportInput,
  InterpretSearchInput,
  ProjectSummary,
  ProjectSummaryInput,
} from "./types";
import { analyzeLocally } from "./local/localVision";
import { interpretLocally } from "./local/queryInterpreter";
import { assembleReport, countActivityAssets, DEFAULT_METHODOLOGY } from "./reportBuilder";

/**
 * Local provider. Runs entirely in-process with no network access:
 * pre-computed analysis for the demo workspace, local heuristics for new media.
 */
export class DemoAI implements AIProvider {
  readonly name = "demo" as const;

  async analyzeImage(input: AnalyzeImageInput): Promise<MediaAnalysis> {
    const known = input.assetId ? demoAnalysis[input.assetId] : undefined;
    const base = known ?? analyzeLocally(input);
    return {
      ...base,
      phase: base.phase ?? input.context?.phase,
      location: base.location ?? input.context?.location,
      capturedAt: base.capturedAt ?? input.context?.capturedAt,
      provider: this.name,
      analyzedAt: new Date().toISOString(),
    };
  }

  async compareImages({ project, before, after }: CompareImagesInput): Promise<Comparison> {
    const known = demoComparisons.find((c) => c.beforeAssetId === before.id && c.afterAssetId === after.id);
    if (known) return { ...known, provider: this.name };

    const beforeTerms = new Set([...before.tags, ...before.objects]);
    const afterTerms = new Set([...after.tags, ...after.objects]);
    const removed = [...beforeTerms].filter((t) => !afterTerms.has(t)).slice(0, 3);
    const added = [...afterTerms].filter((t) => !beforeTerms.has(t)).slice(0, 3);
    const observations = [
      ...removed.map((t) => `Less visible ${t}`),
      ...added.map((t) => `${titleCase(t)} now visible`),
    ];
    return {
      id: `cmp_${before.id}_${after.id}`,
      projectId: project.id,
      beforeAssetId: before.id,
      afterAssetId: after.id,
      title: `${before.site ?? before.location} vs ${after.site ?? after.location}`,
      observations: observations.length ? observations : ["No significant visual differences detected between the frames"],
      confidence: Math.round((before.confidence + after.confidence) / 2) - 6,
      summary: observations.length
        ? `AI analysis indicates visible differences between the ${PHASE_LABEL[before.phase].toLowerCase()} and ${PHASE_LABEL[after.phase].toLowerCase()} frames, summarised in the observations above.`
        : "AI analysis did not identify significant visual differences between these frames.",
      provider: this.name,
    };
  }

  async generateProjectSummary({ project, assets, timeline }: ProjectSummaryInput): Promise<ProjectSummary> {
    const n = reportNarratives[project.id];
    if (!assets.length) {
      const st = project.stats;
      return {
        summary:
          n?.summary ??
          `${project.name} is documented by ${st.mediaAssets} field media assets from ${project.location}, of which ${st.analyzedPercent}% have been analyzed. ${st.focusActivityAssets} assets show ${project.focusActivity.toLowerCase()} activity across ${st.phases} project phases.`,
        highlights: [
          `${st.focusActivityAssets} ${project.focusActivity.toLowerCase()} assets identified`,
          `${st.phases} project phases documented`,
          `${st.analyzedPercent}% of project media analyzed`,
        ],
      };
    }
    const activities = uniq(assets.flatMap((a) => a.activities).filter((a) => !a.includes("documentation")));
    return {
      summary: n?.summary ?? `${project.name} has ${assets.length} analyzed media assets across ${timeline.length || 1} documented stages in ${project.location}.`,
      highlights: [
        `${activities.length} distinct field activities identified`,
        `${timeline.length} timeline stages documented`,
        `Average AI confidence ${Math.round(assets.reduce((s, a) => s + a.confidence, 0) / assets.length)}%`,
      ],
    };
  }

  async generateReport({ project, assets, timeline, comparison }: GenerateReportInput): Promise<Report> {
    const n = reportNarratives[project.id];
    if (n) {
      return assembleReport({
        project,
        assets,
        timeline,
        comparison,
        provider: this.name,
        narrative: {
          overview: n.overview,
          summary: n.summary,
          methodology: n.methodology,
          keyActivities: n.keyActivities.map((k) => ({ name: k.name, description: k.description, assetCount: countActivityAssets(assets, k.match) })),
          observedChanges: comparison?.observations ?? [],
          evidence: n.evidenceAssetIds.map((id) => {
            const a = assets.find((x) => x.id === id);
            return { assetId: id, caption: a?.description ?? "" };
          }),
        },
      });
    }

    const activityCounts = new Map<string, number>();
    assets.forEach((a) => a.activities.forEach((act) => activityCounts.set(act, (activityCounts.get(act) ?? 0) + 1)));
    const keyActivities = [...activityCounts.entries()]
      .filter(([k]) => !k.includes("documentation"))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: titleCase(name), description: `Documented in ${count} media asset${count === 1 ? "" : "s"}.`, assetCount: count }));
    const evidence = (["before", "during", "after"] as const)
      .map((p) => assets.find((a) => a.phase === p))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({ assetId: a.id, caption: a.description }));

    return assembleReport({
      project,
      assets,
      timeline,
      comparison,
      provider: this.name,
      narrative: {
        overview: project.description,
        summary: assets.length
          ? `${project.name} documents ${assets.length} analyzed media assets in ${project.location}. Visual evidence covers ${uniq(assets.map((a) => PHASE_LABEL[a.phase].toLowerCase())).join(", ")} project phases.`
          : `${project.name} does not have analyzed media yet. Upload field media to build an evidence-based report.`,
        methodology: DEFAULT_METHODOLOGY,
        keyActivities,
        observedChanges: comparison?.observations ?? [],
        evidence,
      },
    });
  }

  async interpretSearchQuery({ query, vocabulary }: InterpretSearchInput): Promise<SearchInterpretation> {
    return interpretLocally(query, vocabulary);
  }
}
