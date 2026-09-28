import type { Comparison } from "@/types";

/** AI-observed visual changes between matched viewpoints. */
export const demoComparisons: Comparison[] = [
  {
    id: "cmp_blr_sector_a",
    projectId: "bhopal-lake-restoration",
    beforeAssetId: "asset_blr_before_01",
    afterAssetId: "asset_blr_after_01",
    title: "Shoreline Sector A, March vs June",
    observations: [
      "Reduced visible waste",
      "Cleaner shoreline appearance",
      "Greater visibility of water surface",
      "Improved visibility of surrounding vegetation",
    ],
    confidence: 91,
    summary:
      "AI analysis indicates a visible reduction in accumulated shoreline waste and an improvement in the overall visual cleanliness of the restoration area.",
  },
  {
    id: "cmp_blr_ghat_2",
    projectId: "bhopal-lake-restoration",
    beforeAssetId: "asset_blr_before_02",
    afterAssetId: "asset_blr_after_04",
    title: "Ghat 2 steps, March vs June",
    observations: [
      "Waste no longer visible on the ghat steps",
      "Cleaner water edge beside the steps",
      "Steps and surrounding structure clearly visible",
    ],
    confidence: 92,
    summary:
      "AI analysis indicates that the ghat steps, which showed scattered plastic waste in March, appear clear of visible waste in June.",
  },
  {
    id: "cmp_blr_sector_b",
    projectId: "bhopal-lake-restoration",
    beforeAssetId: "asset_blr_before_03",
    afterAssetId: "asset_blr_after_03",
    title: "Shoreline Sector B wide view, March vs June",
    observations: [
      "Less floating debris visible near the shore",
      "Fewer green patches visible on the water surface",
      "More vegetation visible along the bank",
    ],
    confidence: 88,
    summary:
      "AI analysis indicates less visible floating debris and a more open water surface in the June wide view compared with March.",
  },
  {
    id: "cmp_csi_rooftops",
    projectId: "community-solar-installation",
    beforeAssetId: "asset_csi_before_01",
    afterAssetId: "asset_csi_after_01",
    title: "Ward 4 rooftops, February vs June",
    observations: ["Solar panel arrays now visible on three rooftops", "Roof structures otherwise unchanged"],
    confidence: 91,
    summary: "AI analysis indicates that rooftop solar arrays are visible on three houses that had no panels in February.",
  },
  {
    id: "cmp_vwa_water_point",
    projectId: "village-water-access",
    beforeAssetId: "asset_vwa_before_01",
    afterAssetId: "asset_vwa_after_01",
    title: "Hamlet water point, January vs July",
    observations: ["A tap stand is visible with running water", "Water containers are being filled at the tap"],
    confidence: 89,
    summary: "AI analysis indicates a new tap stand with running water in the area previously served by a dry hand pump.",
  },
];
