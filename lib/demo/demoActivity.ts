import type { AIActivityItem } from "@/types";

export const demoActivity: AIActivityItem[] = [
  { id: "act_1", kind: "report", title: "Impact report generated", detail: "Bhopal Lake Restoration, project completion", projectId: "bhopal-lake-restoration", at: "2026-06-28T16:20:00+05:30" },
  { id: "act_2", kind: "comparison", title: "Before / after compared", detail: "Ghat 2 steps, March vs June", projectId: "bhopal-lake-restoration", at: "2026-06-26T10:12:00+05:30" },
  { id: "act_3", kind: "analysis", title: "lake-after-04.jpg analyzed", detail: "Ghat steps clear of visible waste, 92% confidence", projectId: "bhopal-lake-restoration", assetId: "asset_blr_after_04", at: "2026-06-24T18:09:00+05:30" },
  { id: "act_4", kind: "analysis", title: "solar-after-01.jpg analyzed", detail: "Solar arrays on three rooftops, 91% confidence", projectId: "community-solar-installation", assetId: "asset_csi_after_01", at: "2026-06-18T17:34:00+05:30" },
  { id: "act_5", kind: "search", title: "AI search", detail: "\u201cShow me evidence of waste removal\u201d, 6 results", projectId: "bhopal-lake-restoration", at: "2026-06-15T09:02:00+05:30" },
  { id: "act_6", kind: "analysis", title: "water-during-01.jpg analyzed", detail: "Pipeline trench with workers, 89% confidence", projectId: "village-water-access", assetId: "asset_vwa_during_01", at: "2026-04-11T11:19:00+05:30" },
];

/** Monthly media ingestion and analysis across the workspace. */
export const demoMediaActivity = [
  { month: "Jan", uploaded: 22, analyzed: 19 },
  { month: "Feb", uploaded: 41, analyzed: 36 },
  { month: "Mar", uploaded: 78, analyzed: 69 },
  { month: "Apr", uploaded: 104, analyzed: 92 },
  { month: "May", uploaded: 96, analyzed: 83 },
  { month: "Jun", uploaded: 97, analyzed: 82 },
];
