import type { MediaAnalysis, Phase } from "@/types";
import type { AnalyzeImageInput } from "../types";
import { uniq } from "@/lib/utils";

interface Rule {
  match: RegExp;
  tags: string[];
  objects: string[];
  activities: string[];
  phrase: string;
}

const RULES: Rule[] = [
  { match: /lake|pond|river|water|shore|ghat|talab|wetland/, tags: ["water", "lake", "shoreline"], objects: ["water"], activities: [], phrase: "a waterbody and its shoreline" },
  { match: /waste|garbage|trash|plastic|litter|debris|dump/, tags: ["waste", "plastic"], objects: ["plastic waste"], activities: [], phrase: "visible waste" },
  { match: /clean|cleanup|removal|collect|sack/, tags: ["cleaning", "waste"], objects: ["people", "collection sacks"], activities: ["waste removal"], phrase: "cleanup activity" },
  { match: /plant|tree|sapling|green|nursery/, tags: ["plantation", "saplings", "vegetation"], objects: ["saplings"], activities: ["plantation"], phrase: "plantation work" },
  { match: /solar|panel|pv|rooftop/, tags: ["solar", "rooftop", "energy"], objects: ["solar panels"], activities: ["panel installation"], phrase: "rooftop solar equipment" },
  { match: /pipe|pipeline|tap|pump|borewell|tank/, tags: ["water", "pipeline", "access"], objects: ["pipe"], activities: ["pipeline construction"], phrase: "water access infrastructure" },
  { match: /worker|volunteer|team|crew|community|drive/, tags: ["workers", "community"], objects: ["people"], activities: ["community participation"], phrase: "people working on site" },
];

const TYPE_DEFAULTS: Record<string, Rule> = {
  "Environmental Restoration": { match: /./, tags: ["environment", "restoration", "site"], objects: ["landscape"], activities: ["site documentation"], phrase: "a restoration site" },
  "Renewable Energy": { match: /./, tags: ["energy", "site"], objects: ["buildings"], activities: ["site documentation"], phrase: "an energy project site" },
  "Water & Sanitation": { match: /./, tags: ["water", "sanitation", "site"], objects: ["infrastructure"], activities: ["site documentation"], phrase: "a water and sanitation site" },
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function guessPhase(text: string, fallback?: Phase): Phase {
  if (/after|post|final|complete|done/.test(text)) return "after";
  if (/before|pre|baseline|initial|survey/.test(text)) return "before";
  if (/during|progress|work|install|drive/.test(text)) return "during";
  return fallback ?? "during";
}

/**
 * On-device analysis used by the demo provider for media that has no
 * pre-computed record: combines filename cues with project context.
 */
export function analyzeLocally(input: AnalyzeImageInput): MediaAnalysis {
  const name = (input.filename ?? input.imageUrl.split("/").pop() ?? "").toLowerCase().replace(/[_\-.]+/g, " ");
  const ctxText = `${name} ${input.context?.projectName ?? ""}`.toLowerCase();
  const hits = RULES.filter((r) => r.match.test(ctxText));
  const base = TYPE_DEFAULTS[input.context?.projectType ?? ""] ?? TYPE_DEFAULTS["Environmental Restoration"];
  const used = hits.length ? hits : [base];

  const activities = uniq(used.flatMap((r) => r.activities));
  const phase = input.context?.phase ?? guessPhase(name);
  const subject = used.map((r) => r.phrase).slice(0, 2).join(" and ");
  const where = input.context?.location ? ` in ${input.context.location.split(",")[0]}` : "";

  return {
    description: `Field ${input.resourceType === "video" ? "video" : "photo"}${where} showing ${subject}${activities.length && !activities.includes("site documentation") ? `, consistent with ${activities[0]}` : ""}.`,
    tags: uniq([...used.flatMap((r) => r.tags), "field media"]).slice(0, 8),
    objects: uniq(used.flatMap((r) => r.objects)).slice(0, 6),
    activities: activities.length ? activities : ["site documentation"],
    confidence: 74 + (hash(name) % 13),
    phase,
    location: input.context?.location,
    capturedAt: input.context?.capturedAt,
  };
}
