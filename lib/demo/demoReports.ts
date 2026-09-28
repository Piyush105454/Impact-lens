import type { ReportListItem } from "@/types";

/** Narrative building blocks the local report writer uses per project. */
export interface ReportNarrative {
  overview: string;
  summary: string;
  methodology: string;
  keyActivities: { name: string; description: string; match: string[] }[];
  evidenceAssetIds: string[];
  primaryComparisonId: string;
}

export const reportNarratives: Record<string, ReportNarrative> = {
  "bhopal-lake-restoration": {
    overview:
      "The Bhopal Lake Restoration project was a four-month shoreline cleanup and restoration initiative. Field teams documented site conditions at fixed viewpoints across four shoreline sectors, a public ghat and an inflow channel, capturing 128 media assets from baseline survey through post-project condition.",
    summary:
      "The Bhopal Lake Restoration project documents a sequence of shoreline cleanup and restoration activities between March and June 2026. Visual evidence shows changes in shoreline cleanliness and the visible presence of accumulated waste across project phases. Repeat photography from the baseline viewpoints shows less visible waste, a more visible water surface and more vegetation along the bank in June than in March.",
    methodology:
      "Findings in this report are AI-observed visual changes derived from field photographs and video. Each statement is linked to its source media asset. Visual observations describe what is visible in the frame; they are not laboratory measurements of water quality or pollution levels and should be read alongside verified field data where available.",
    keyActivities: [
      { name: "Waste removal", description: "Manual removal of accumulated plastic waste from the shoreline and bank using rakes and collection sacks.", match: ["waste removal", "shoreline cleaning"] },
      { name: "Waste collection", description: "Aggregation of collected waste in sacks at a shoreline collection point.", match: ["waste collection"] },
      { name: "Floating debris removal", description: "Removal of floating debris from the water surface by boat during a community cleanup drive.", match: ["floating debris removal", "community participation"] },
      { name: "Shoreline plantation", description: "Planting of saplings protected by wooden tree guards along Sector D.", match: ["plantation", "shoreline restoration"] },
      { name: "Inflow channel clearing", description: "Clearing of debris accumulated around Inflow Channel 1.", match: ["channel clearing"] },
    ],
    evidenceAssetIds: ["asset_blr_before_01", "asset_blr_during_01", "asset_blr_during_03", "asset_blr_during_04", "asset_blr_after_01", "asset_blr_after_04"],
    primaryComparisonId: "cmp_blr_sector_a",
  },
  "community-solar-installation": {
    overview: "Rooftop solar installation for village households in Sehore, documented from site survey to commissioned systems.",
    summary: "Visual evidence documents the progression from rooftops without solar equipment in February to mounted solar arrays on three rooftops in June 2026.",
    methodology: "Findings are AI-observed visual changes linked to source media. They do not represent measured energy generation.",
    keyActivities: [{ name: "Panel installation", description: "Rooftop mounting of solar panels by technicians.", match: ["panel installation"] }],
    evidenceAssetIds: ["asset_csi_before_01", "asset_csi_during_01", "asset_csi_after_01"],
    primaryComparisonId: "cmp_csi_rooftops",
  },
  "village-water-access": {
    overview: "Piped drinking-water access for village households in Raisen, from the existing hand pump to new tap stands.",
    summary: "Visual evidence documents pipeline construction through the village and a completed tap stand with running water.",
    methodology: "Findings are AI-observed visual changes linked to source media. They do not represent measured water supply or quality.",
    keyActivities: [{ name: "Pipeline construction", description: "Trenching and pipe laying through the main lane.", match: ["pipeline construction"] }],
    evidenceAssetIds: ["asset_vwa_before_01", "asset_vwa_during_01", "asset_vwa_after_01"],
    primaryComparisonId: "cmp_vwa_water_point",
  },
};

export const demoReportHistory: ReportListItem[] = [
  { id: "rpt_bhopal-lake-restoration_final", projectId: "bhopal-lake-restoration", projectName: "Bhopal Lake Restoration", title: "Impact Report: Project Completion", generatedAt: "2026-06-28T16:20:00+05:30", assetCount: 13 },
  { id: "rpt_bhopal-lake-restoration_may", projectId: "bhopal-lake-restoration", projectName: "Bhopal Lake Restoration", title: "Progress Report: May 2026", generatedAt: "2026-05-31T15:05:00+05:30", assetCount: 9 },
  { id: "rpt_community-solar-installation_q2", projectId: "community-solar-installation", projectName: "Community Solar Installation", title: "Progress Report: Q2 2026", generatedAt: "2026-06-30T12:40:00+05:30", assetCount: 3 },
  { id: "rpt_village-water-access_apr", projectId: "village-water-access", projectName: "Village Water Access", title: "Construction Update: April 2026", generatedAt: "2026-04-30T11:10:00+05:30", assetCount: 3 },
  { id: "rpt_urban-tree-plantation_final", projectId: "urban-tree-plantation", projectName: "Urban Tree Plantation Drive", title: "Impact Report: Project Completion", generatedAt: "2026-04-29T10:00:00+05:30", assetCount: 11 },
];
