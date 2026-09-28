import type { Phase } from "@/types";

/**
 * Vocabulary used by the local AI search interpreter to map natural-language
 * queries onto the structured metadata produced by media analysis.
 */
export interface SearchConcept {
  label: string; // shown as the interpreted activity / topic
  kind: "activity" | "topic";
  triggers: string[]; // words or phrases in the query
  tags: string[]; // shown in the search interpretation
  related: string[]; // extra metadata terms used for ranking
}

export const searchConcepts: SearchConcept[] = [
  { label: "Waste Removal", kind: "activity", triggers: ["waste removal", "remove waste", "removing waste", "cleanup", "clean up", "clean-up", "cleaning", "garbage", "trash", "litter", "rubbish", "debris removal"], tags: ["waste", "shoreline", "cleaning"], related: ["waste removal", "shoreline cleaning", "waste collection", "sacks", "floating debris removal", "channel clearing", "rakes"] },
  { label: "Waste", kind: "topic", triggers: ["waste", "plastic", "pollution", "debris", "bottles", "bags"], tags: ["waste", "plastic"], related: ["plastic waste", "plastic bottles", "plastic bags", "floating debris"] },
  { label: "Water", kind: "topic", triggers: ["water", "lake", "aquatic", "shore", "shoreline", "waterbody", "water-related"], tags: ["water", "lake", "shoreline"], related: ["running water", "tap stand", "hand pump", "inflow channel", "boat"] },
  { label: "Restoration", kind: "activity", triggers: ["restoration", "restore", "restoring", "rehabilitation"], tags: ["restoration", "plantation", "saplings"], related: ["shoreline restoration", "plantation", "saplings", "channel clearing", "tree guards"] },
  { label: "Plantation", kind: "activity", triggers: ["plant", "planting", "plantation", "sapling", "saplings", "tree", "trees", "greening"], tags: ["plantation", "saplings", "vegetation"], related: ["tree guards", "shoreline restoration"] },
  { label: "Vegetation", kind: "topic", triggers: ["vegetation", "green", "grass", "greenery"], tags: ["vegetation", "grass"], related: ["saplings", "sparse vegetation", "tree line"] },
  { label: "Community Participation", kind: "activity", triggers: ["community", "volunteer", "volunteers", "drive", "participation", "people"], tags: ["community", "cleanup drive"], related: ["cleanup drive", "people", "workers"] },
  { label: "Workers on Site", kind: "topic", triggers: ["worker", "workers", "crew", "labour", "labor", "staff", "technician", "technicians"], tags: ["workers", "technicians"], related: ["people"] },
  { label: "Solar Installation", kind: "activity", triggers: ["solar", "panel", "panels", "installation", "rooftop"], tags: ["solar", "solar panels"], related: ["panel installation", "rooftop", "technicians"] },
  { label: "Water Access", kind: "activity", triggers: ["tap", "pipeline", "pipe", "drinking water", "hand pump"], tags: ["tap stand", "pipeline", "hand pump"], related: ["water collection", "water containers", "pipe", "trench"] },
  { label: "Inflow Channel", kind: "topic", triggers: ["drain", "channel", "inflow", "outlet", "nala"], tags: ["inflow channel", "drain"], related: ["concrete channel", "channel clearing"] },
  { label: "Ghat", kind: "topic", triggers: ["ghat", "steps", "stairs"], tags: ["ghat", "steps"], related: ["stone steps", "public space"] },
  { label: "Boat Operations", kind: "topic", triggers: ["boat", "floating"], tags: ["boat", "floating debris"], related: ["floating debris removal"] },
];

export const phaseTriggers: Record<Phase, string[]> = {
  before: ["before", "baseline", "initial", "pre-project", "starting", "original condition"],
  during: ["during", "in progress", "ongoing", "activities", "work in progress"],
  after: ["after", "post-project", "final", "completed", "outcome", "result"],
};

export const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export const knownLocations = ["Bhopal", "Sehore", "Raisen", "Sector A", "Sector B", "Sector D", "Ghat 2", "Inflow Channel 1", "Collection Point C"];

export const exampleQueries = [
  "Show me evidence of waste removal",
  "Show before and after evidence from March to June",
  "Find all water-related evidence",
  "Show images from Bhopal during restoration",
];
