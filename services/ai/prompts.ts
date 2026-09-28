/**
 * Prompts shared by the hosted providers (Gemini, OpenAI). Kept in one place so
 * both vendors produce the same normalized JSON shape.
 */
export const SYSTEM_GUARDRAILS = `You are the media intelligence engine of ImpactLens, a platform for NGOs and governments that documents field projects.
Rules:
- Describe only what is visible. Never invent measurements, percentages of improvement, water quality, pollution levels or counts you cannot see.
- Phrase changes as "AI-observed visual changes".
- Respond with JSON only. No markdown fences, no commentary.`;

export function analyzeImagePrompt(ctx: { projectName?: string; projectType?: string; location?: string; phase?: string; filename?: string }) {
  return `${SYSTEM_GUARDRAILS}

Analyze this field photo${ctx.projectName ? ` from the project "${ctx.projectName}" (${ctx.projectType ?? "field project"})` : ""}${ctx.location ? ` in ${ctx.location}` : ""}.
${ctx.filename ? `Original filename: ${ctx.filename}.` : ""}
Return JSON:
{
  "description": "one or two sentences describing what is visible",
  "tags": ["5-8 lowercase search tags"],
  "objects": ["visible objects, lowercase"],
  "activities": ["activities taking place, lowercase; use 'site documentation' if none"],
  "confidence": 0-100 integer,
  "phase": "before" | "during" | "after" (best guess of project phase from what is visible)
}`;
}

export function compareImagesPrompt(title: string) {
  return `${SYSTEM_GUARDRAILS}

The first image is BEFORE, the second is AFTER, taken at the same site (${title}).
List AI-observed visual changes only. Return JSON:
{
  "observations": ["3-5 short statements such as 'Reduced visible waste'"],
  "summary": "one sentence starting with 'AI analysis indicates'",
  "confidence": 0-100 integer
}`;
}

export function searchPrompt(query: string, vocab: { tags: string[]; activities: string[]; locations: string[] }, projectName: string) {
  return `${SYSTEM_GUARDRAILS}

Interpret a natural-language search over the media library of "${projectName}".
Known tags: ${vocab.tags.join(", ")}
Known activities: ${vocab.activities.join(", ")}
Known locations: ${vocab.locations.join(", ")}
Query: "${query}"
Return JSON:
{
  "intent": "short description of what the user wants",
  "activities": ["matching known activities, Title Case"],
  "tags": ["matching known tags"],
  "phases": ["before" | "during" | "after"],
  "locations": ["matching known locations"],
  "dateRange": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD", "label": "e.g. March – June 2026" } or null
}`;
}

export function reportPrompt(payload: unknown) {
  return `${SYSTEM_GUARDRAILS}

Write the narrative sections of a professional NGO impact report from this project evidence (JSON):
${JSON.stringify(payload)}
Return JSON:
{
  "overview": "2-3 sentences",
  "summary": "3-4 sentences of AI summary grounded only in the evidence",
  "keyActivities": [{ "name": "", "description": "" }],
  "observedChanges": ["AI-observed visual changes"],
  "evidence": [{ "assetId": "", "caption": "" }]
}`;
}

export function summaryPrompt(payload: unknown) {
  return `${SYSTEM_GUARDRAILS}

Summarize this project's visual evidence (JSON): ${JSON.stringify(payload)}
Return JSON: { "summary": "2-3 sentences", "highlights": ["3-4 short highlights"] }`;
}
