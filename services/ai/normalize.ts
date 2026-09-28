import type { MediaAnalysis, Phase, SearchInterpretation } from "@/types";

const PHASES: Phase[] = ["before", "during", "after"];

export function stripJson(text: string): unknown {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI response did not contain JSON");
  return JSON.parse(clean.slice(start, end + 1));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function strArr(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim()).slice(0, max);
}

export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export function clampConfidence(v: unknown, fallback = 80): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  const pct = n <= 1 ? n * 100 : n;
  return Math.round(Math.min(99, Math.max(1, pct)));
}

export function asPhase(v: unknown): Phase | undefined {
  return typeof v === "string" && (PHASES as string[]).includes(v.toLowerCase()) ? (v.toLowerCase() as Phase) : undefined;
}

export function normalizeAnalysis(raw: unknown): MediaAnalysis {
  if (!isRecord(raw)) throw new Error("Invalid analysis payload");
  return {
    description: str(raw.description, "No description returned."),
    tags: strArr(raw.tags).map((t) => t.toLowerCase()),
    objects: strArr(raw.objects).map((t) => t.toLowerCase()),
    activities: strArr(raw.activities).map((t) => t.toLowerCase()),
    confidence: clampConfidence(raw.confidence),
    phase: asPhase(raw.phase),
  };
}

export function normalizeInterpretation(query: string, raw: unknown): SearchInterpretation {
  if (!isRecord(raw)) throw new Error("Invalid search payload");
  const dr = isRecord(raw.dateRange) ? raw.dateRange : null;
  return {
    query,
    intent: str(raw.intent, query),
    activities: strArr(raw.activities),
    tags: strArr(raw.tags).map((t) => t.toLowerCase()),
    phases: strArr(raw.phases).map(asPhase).filter((p): p is Phase => Boolean(p)),
    locations: strArr(raw.locations),
    dateRange: dr && str(dr.from) && str(dr.to) ? { from: str(dr.from), to: str(dr.to), label: str(dr.label, `${str(dr.from)} – ${str(dr.to)}`) } : undefined,
  };
}

export { isRecord };
