import type { Phase, ResourceType, SearchInterpretation } from "@/types";
import { MONTHS, knownLocations, phaseTriggers, searchConcepts } from "@/lib/demo/demoSearch";
import { titleCase, uniq } from "@/lib/utils";

const STOPWORDS = new Set(["show", "me", "find", "all", "the", "of", "from", "and", "to", "in", "on", "for", "with", "evidence", "images", "image", "photos", "videos", "video", "media", "any", "some", "that", "this", "please", "related", "where", "what", "which", "are", "is", "was", "were", "during", "before", "after", "between", "at", "a", "an"]);

function hasPhrase(q: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(q);
}

function lastDayOfMonth(year: number, monthIdx: number) {
  return new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
}

/**
 * Local natural-language interpreter. Maps a query to activities, tags,
 * phases, locations, media type and a date range using the project vocabulary.
 */
export function interpretLocally(query: string, vocab: { locations: string[] }): SearchInterpretation {
  const q = query.toLowerCase().trim();

  const concepts = searchConcepts.filter((c) => c.triggers.some((t) => hasPhrase(q, t)));
  // Prefer the more specific concept when one activity subsumes a topic (e.g. "waste removal" vs "waste").
  const activities = uniq(concepts.filter((c) => c.kind === "activity").map((c) => c.label));
  const tags = uniq(concepts.flatMap((c) => c.tags)).slice(0, 6);

  const phases = (Object.keys(phaseTriggers) as Phase[]).filter((p) => phaseTriggers[p].some((t) => hasPhrase(q, t)));

  let mediaType: ResourceType | undefined;
  if (/\b(video|videos|footage|clip|clips)\b/.test(q)) mediaType = "video";
  else if (/\b(image|images|photo|photos|picture|pictures)\b/.test(q)) mediaType = "image";

  const locations = uniq([...knownLocations, ...vocab.locations].filter((l) => hasPhrase(q, l.toLowerCase().split(",")[0])).map((l) => l.split(",")[0]));

  const yearMatch = q.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 2026;
  const months = MONTHS.map((m, i) => ({ m, i, pos: q.search(new RegExp(`\\b${m}\\b|\\b${m.slice(0, 3)}\\b`)) }))
    .filter((x) => x.pos >= 0)
    .sort((a, b) => a.pos - b.pos);
  let dateRange: SearchInterpretation["dateRange"];
  if (months.length) {
    const first = months[0];
    const last = months[months.length - 1];
    const lo = Math.min(first.i, last.i);
    const hi = Math.max(first.i, last.i);
    const from = `${year}-${String(lo + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(hi + 1).padStart(2, "0")}-${lastDayOfMonth(year, hi)}`;
    const label = lo === hi ? `${titleCase(MONTHS[lo])} ${year}` : `${titleCase(MONTHS[lo])} – ${titleCase(MONTHS[hi])} ${year}`;
    dateRange = { from, to, label };
  }

  // Fallback: keep meaningful words so free-form queries still match metadata.
  const fallbackTags =
    concepts.length === 0
      ? uniq(q.split(/[^a-z-]+/).filter((w) => w.length > 3 && !STOPWORDS.has(w) && !MONTHS.includes(w) && !locations.some((l) => l.toLowerCase().includes(w))))
      : [];

  const intentParts: string[] = [];
  if (phases.includes("before") && phases.includes("after")) intentParts.push("Compare before and after evidence");
  else if (activities.length) intentParts.push(`Find evidence of ${activities.map((a) => a.toLowerCase()).join(" and ")}`);
  else if (tags.length || fallbackTags.length) intentParts.push(`Find ${uniq([...tags, ...fallbackTags]).slice(0, 2).join(" and ")} evidence`);
  else intentParts.push("Browse project evidence");
  if (phases.length === 1) intentParts.push(`${phases[0]} the project`);
  if (locations.length) intentParts.push(`at ${locations.join(", ")}`);
  if (dateRange) intentParts.push(`(${dateRange.label})`);

  return {
    query,
    intent: intentParts.join(" "),
    activities,
    tags: tags.length ? tags : fallbackTags.slice(0, 6),
    phases,
    locations,
    mediaType,
    dateRange,
  };
}
