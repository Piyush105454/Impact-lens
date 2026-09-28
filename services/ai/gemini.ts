import "server-only";
import type { Comparison, MediaAnalysis, Report, SearchInterpretation } from "@/types";
import type {
  AIProvider,
  AnalyzeImageInput,
  CompareImagesInput,
  GenerateReportInput,
  InterpretSearchInput,
  ProjectSummary,
  ProjectSummaryInput,
} from "./types";
import { analyzeImagePrompt, compareImagesPrompt, reportPrompt, searchPrompt, summaryPrompt } from "./prompts";
import { clampConfidence, isRecord, normalizeAnalysis, normalizeInterpretation, str, strArr, stripJson } from "./normalize";
import { fetchImageAsBase64, withTimeout } from "./shared";
import { assembleReport, DEFAULT_METHODOLOGY } from "./reportBuilder";

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

/**
 * Google Gemini provider (Generative Language REST API).
 * Only constructed when AI_PROVIDER=gemini and GEMINI_API_KEY is set.
 */
export class GeminiAI implements AIProvider {
  readonly name = "gemini" as const;
  constructor(private readonly apiKey: string, private readonly model: string) {}

  private async generate(parts: Part[]): Promise<unknown> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      }),
      30_000,
      "Gemini request",
    );
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json: unknown = await res.json();
    const text =
      isRecord(json) && Array.isArray(json.candidates) && isRecord(json.candidates[0]) && isRecord(json.candidates[0].content)
        ? (json.candidates[0].content.parts as { text?: string }[] | undefined)?.map((p) => p.text ?? "").join("")
        : undefined;
    if (!text) throw new Error("Gemini returned an empty response");
    return stripJson(text);
  }

  private async image(url: string): Promise<Part> {
    const img = await fetchImageAsBase64(url);
    return { inline_data: { mime_type: img.mimeType, data: img.data } };
  }

  async analyzeImage(input: AnalyzeImageInput): Promise<MediaAnalysis> {
    const raw = await this.generate([{ text: analyzeImagePrompt({ ...input.context, filename: input.filename }) }, await this.image(input.imageUrl)]);
    const a = normalizeAnalysis(raw);
    return { ...a, phase: a.phase ?? input.context?.phase, location: input.context?.location, capturedAt: input.context?.capturedAt, provider: this.name, analyzedAt: new Date().toISOString() };
  }

  async compareImages({ project, before, after, beforeUrl, afterUrl }: CompareImagesInput): Promise<Comparison> {
    const title = `${before.site ?? before.location}`;
    const raw = await this.generate([{ text: compareImagesPrompt(title) }, await this.image(beforeUrl), await this.image(afterUrl)]);
    if (!isRecord(raw)) throw new Error("Invalid comparison payload");
    return {
      id: `cmp_${before.id}_${after.id}`,
      projectId: project.id,
      beforeAssetId: before.id,
      afterAssetId: after.id,
      title,
      observations: strArr(raw.observations, 6),
      summary: str(raw.summary, "AI analysis indicates visible differences between the frames."),
      confidence: clampConfidence(raw.confidence),
      provider: this.name,
    };
  }

  async generateProjectSummary({ project, assets, timeline }: ProjectSummaryInput): Promise<ProjectSummary> {
    const raw = await this.generate([{ text: summaryPrompt({ project: project.name, location: project.location, timeline: timeline.map((t) => t.aiSummary), assets: assets.map((a) => ({ phase: a.phase, description: a.description })) }) }]);
    if (!isRecord(raw)) throw new Error("Invalid summary payload");
    return { summary: str(raw.summary), highlights: strArr(raw.highlights, 5) };
  }

  async generateReport({ project, assets, timeline, comparison }: GenerateReportInput): Promise<Report> {
    const raw = await this.generate([{ text: reportPrompt(evidencePayload({ project, assets, timeline, comparison })) }]);
    return reportFromRaw(raw, { project, assets, timeline, comparison }, this.name);
  }

  async interpretSearchQuery({ query, project, vocabulary }: InterpretSearchInput): Promise<SearchInterpretation> {
    const raw = await this.generate([{ text: searchPrompt(query, vocabulary, project.name) }]);
    return normalizeInterpretation(query, raw);
  }
}

/** Compact, grounded evidence payload shared by hosted providers. */
export function evidencePayload({ project, assets, timeline, comparison }: GenerateReportInput) {
  return {
    project: { name: project.name, type: project.type, location: project.location, period: `${project.startDate} to ${project.endDate}` },
    timeline: timeline.map((t) => ({ date: t.date, title: t.title, summary: t.aiSummary })),
    assets: assets.map((a) => ({ assetId: a.id, phase: a.phase, date: a.capturedAt.slice(0, 10), site: a.site, description: a.description, activities: a.activities })),
    comparison: comparison ? { observations: comparison.observations, summary: comparison.summary } : null,
  };
}

export function reportFromRaw(raw: unknown, input: GenerateReportInput, provider: "gemini" | "openai"): Report {
  if (!isRecord(raw)) throw new Error("Invalid report payload");
  const acts = Array.isArray(raw.keyActivities) ? raw.keyActivities.filter(isRecord) : [];
  const ev = Array.isArray(raw.evidence) ? raw.evidence.filter(isRecord) : [];
  return assembleReport({
    ...input,
    provider,
    narrative: {
      overview: str(raw.overview, input.project.description),
      summary: str(raw.summary),
      methodology: DEFAULT_METHODOLOGY,
      keyActivities: acts.map((k) => ({ name: str(k.name), description: str(k.description), assetCount: 0 })).filter((k) => k.name),
      observedChanges: strArr(raw.observedChanges, 8),
      evidence: ev.map((e) => ({ assetId: str(e.assetId), caption: str(e.caption) })),
    },
  });
}
