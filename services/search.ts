import "server-only";
import type { MediaAsset, SearchInterpretation, SearchResponse, SearchResult } from "@/types";
import { searchConcepts } from "@/lib/demo/demoSearch";
import { uniq } from "@/lib/utils";
import { getRepository } from "./repository";
import { getAIProvider } from "./ai";

function termsFor(i: SearchInterpretation) {
  const labels = new Set(i.activities.map((a) => a.toLowerCase()));
  const related = searchConcepts.filter((c) => labels.has(c.label.toLowerCase()) || c.tags.some((t) => i.tags.includes(t))).flatMap((c) => [...c.tags, ...c.related]);
  return uniq([...i.tags, ...i.activities.map((a) => a.toLowerCase()), ...related].map((t) => t.toLowerCase()));
}

function passesFilters(a: MediaAsset, i: SearchInterpretation) {
  if (i.phases.length && !i.phases.includes(a.phase)) return false;
  if (i.mediaType && a.resourceType !== i.mediaType) return false;
  if (i.dateRange) {
    const d = a.capturedAt.slice(0, 10);
    if (d < i.dateRange.from || d > i.dateRange.to) return false;
  }
  if (i.locations.length) {
    const hay = `${a.location} ${a.site ?? ""}`.toLowerCase();
    if (!i.locations.some((l) => hay.includes(l.toLowerCase()))) return false;
  }
  return true;
}

/**
 * Ranks assets against an interpreted query using AI-generated metadata.
 * Activities weigh most, then tags/objects, then description text.
 */
export function rankAssets(assets: MediaAsset[], i: SearchInterpretation): SearchResult[] {
  const terms = termsFor(i);
  const hasFilters = i.phases.length > 0 || i.locations.length > 0 || Boolean(i.dateRange) || Boolean(i.mediaType);
  const activityTerms = new Set(termsFor({ ...i, tags: [] }));

  return assets
    .filter((a) => passesFilters(a, i))
    .map((a) => {
      const matched: string[] = [];
      let score = 0;
      const acts = a.activities.map((x) => x.toLowerCase());
      const meta = [...a.tags, ...a.objects].map((x) => x.toLowerCase());
      const desc = a.description.toLowerCase();

      const actHits = acts.filter((x) => activityTerms.has(x) && i.activities.length);
      if (actHits.length) {
        score += 0.45 + 0.05 * (actHits.length - 1);
        matched.push(...actHits);
      }
      const tagHits = terms.filter((t) => meta.includes(t));
      score += Math.min(0.35, tagHits.length * 0.08);
      matched.push(...tagHits);
      const textHits = terms.filter((t) => !tagHits.includes(t) && desc.includes(t));
      score += Math.min(0.12, textHits.length * 0.04);

      if (terms.length === 0 && hasFilters) score = 0.6;
      else if (hasFilters && score > 0) score += 0.1;
      else if (hasFilters) score = 0.2;
      score = score * (0.85 + (a.confidence / 100) * 0.15);
      return { asset: a, score: Math.min(0.99, Number(score.toFixed(3))), matchedOn: uniq(matched).slice(0, 5) };
    })
    .filter((r) => r.score >= 0.15)
    .sort((x, y) => y.score - x.score || x.asset.capturedAt.localeCompare(y.asset.capturedAt))
    // Drop weak tail matches relative to the strongest evidence.
    .filter((r, _i, all) => r.score >= all[0].score * 0.45);
}

export async function searchProject(projectId: string, query: string): Promise<SearchResponse | null> {
  const started = Date.now();
  const repo = getRepository();
  const project = await repo.getProject(projectId);
  if (!project) return null;
  const assets = await repo.listMedia(projectId);
  const provider = getAIProvider();
  const interpretation = await provider.interpretSearchQuery({
    query,
    project,
    vocabulary: {
      tags: uniq(assets.flatMap((a) => a.tags)),
      activities: uniq(assets.flatMap((a) => a.activities)),
      locations: uniq(assets.flatMap((a) => [a.location, a.site ?? ""]).filter(Boolean)),
    },
  });
  const results = rankAssets(assets, interpretation);
  await repo.logSearch(projectId, query, interpretation).catch(() => undefined);
  return { interpretation, results, tookMs: Date.now() - started, provider: provider.name };
}
