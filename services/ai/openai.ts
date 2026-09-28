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
import { analyzeImagePrompt, compareImagesPrompt, reportPrompt, searchPrompt, summaryPrompt, SYSTEM_GUARDRAILS } from "./prompts";
import { clampConfidence, isRecord, normalizeAnalysis, normalizeInterpretation, str, strArr, stripJson } from "./normalize";
import { fetchImageAsBase64, withTimeout } from "./shared";
import { evidencePayload, reportFromRaw } from "./gemini";

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "low" | "high" | "auto" } };

/**
 * OpenAI provider (Chat Completions with vision + JSON mode).
 * Only constructed when AI_PROVIDER=openai and OPENAI_API_KEY is set.
 */
export class OpenAIAI implements AIProvider {
  readonly name = "openai" as const;
  constructor(private readonly apiKey: string, private readonly model: string) {}

  private async complete(content: ContentPart[]): Promise<unknown> {
    const res = await withTimeout(
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_GUARDRAILS },
            { role: "user", content },
          ],
        }),
      }),
      30_000,
      "OpenAI request",
    );
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json: unknown = await res.json();
    const text =
      isRecord(json) && Array.isArray(json.choices) && isRecord(json.choices[0]) && isRecord(json.choices[0].message)
        ? str(json.choices[0].message.content)
        : "";
    if (!text) throw new Error("OpenAI returned an empty response");
    return stripJson(text);
  }

  /** Public HTTPS media (e.g. Cloudinary) is passed by URL; anything else is inlined. */
  private async image(url: string): Promise<ContentPart> {
    if (url.startsWith("https://res.cloudinary.com/")) return { type: "image_url", image_url: { url, detail: "auto" } };
    const img = await fetchImageAsBase64(url);
    return { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}`, detail: "auto" } };
  }

  async analyzeImage(input: AnalyzeImageInput): Promise<MediaAnalysis> {
    const raw = await this.complete([{ type: "text", text: analyzeImagePrompt({ ...input.context, filename: input.filename }) }, await this.image(input.imageUrl)]);
    const a = normalizeAnalysis(raw);
    return { ...a, phase: a.phase ?? input.context?.phase, location: input.context?.location, capturedAt: input.context?.capturedAt, provider: this.name, analyzedAt: new Date().toISOString() };
  }

  async compareImages({ project, before, after, beforeUrl, afterUrl }: CompareImagesInput): Promise<Comparison> {
    const title = `${before.site ?? before.location}`;
    const raw = await this.complete([{ type: "text", text: compareImagesPrompt(title) }, await this.image(beforeUrl), await this.image(afterUrl)]);
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
    const raw = await this.complete([{ type: "text", text: summaryPrompt({ project: project.name, location: project.location, timeline: timeline.map((t) => t.aiSummary), assets: assets.map((a) => ({ phase: a.phase, description: a.description })) }) }]);
    if (!isRecord(raw)) throw new Error("Invalid summary payload");
    return { summary: str(raw.summary), highlights: strArr(raw.highlights, 5) };
  }

  async generateReport(input: GenerateReportInput): Promise<Report> {
    const raw = await this.complete([{ type: "text", text: reportPrompt(evidencePayload(input)) }]);
    return reportFromRaw(raw, input, this.name);
  }

  async interpretSearchQuery({ query, project, vocabulary }: InterpretSearchInput): Promise<SearchInterpretation> {
    const raw = await this.complete([{ type: "text", text: searchPrompt(query, vocabulary, project.name) }]);
    return normalizeInterpretation(query, raw);
  }
}
