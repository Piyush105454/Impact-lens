import type { MediaAnalysis } from "@/types";

/**
 * Pre-computed analysis for the demo workspace. Every statement is a visual
 * observation of the frame. No measurements are inferred from imagery.
 */
export const demoAnalysis: Record<string, MediaAnalysis> = {
  // ── Bhopal Lake Restoration: before ─────────────────────
  asset_blr_before_01: {
    description:
      "Accumulated plastic waste is visible along the lake shoreline, with bottles and bags scattered across the bank and floating near the water's edge.",
    tags: ["lake", "water", "waste", "shoreline", "plastic", "environment"],
    objects: ["plastic bottles", "plastic bags", "water", "shoreline", "sparse vegetation"],
    activities: ["site documentation"],
    confidence: 91,
  },
  asset_blr_before_02: {
    description:
      "Stone ghat steps leading to the lake are covered with scattered plastic waste; debris is also visible on the water surface next to the steps.",
    tags: ["lake", "ghat", "waste", "plastic", "steps", "public space"],
    objects: ["stone steps", "plastic waste", "water", "small shrine structure"],
    activities: ["site documentation"],
    confidence: 89,
  },
  asset_blr_before_03: {
    description:
      "Wide view of the lake with floating debris near the shore and green patches on the water surface; the far bank is lined with trees.",
    tags: ["lake", "water", "floating debris", "shoreline", "landscape", "environment"],
    objects: ["water", "floating debris", "tree line", "shoreline"],
    activities: ["site documentation"],
    confidence: 87,
  },
  asset_blr_before_04: {
    description:
      "Waste has accumulated around a concrete inflow channel where it meets the lake, with dense plastic debris on the surrounding bank.",
    tags: ["inflow channel", "drain", "waste", "plastic", "lake", "water"],
    objects: ["concrete channel", "plastic waste", "water", "bank"],
    activities: ["site documentation"],
    confidence: 90,
  },
  // ── during ─────────────────────────────────────────────
  asset_blr_during_01: {
    description:
      "Workers removing accumulated waste from the lake shoreline using rakes; filled collection sacks are placed on the bank.",
    tags: ["lake", "water", "waste", "environment", "workers", "shoreline", "cleaning"],
    objects: ["people", "water", "plastic waste", "rakes", "collection sacks"],
    activities: ["waste removal", "shoreline cleaning"],
    confidence: 93,
  },
  asset_blr_during_02: {
    description:
      "A collection point on the shore with a large number of filled waste sacks; two workers are gathering remaining debris nearby.",
    tags: ["waste", "collection", "sacks", "shoreline", "workers", "cleaning"],
    objects: ["collection sacks", "people", "plastic waste", "shoreline"],
    activities: ["waste collection", "waste removal"],
    confidence: 92,
  },
  asset_blr_during_03: {
    description:
      "Video of a shoreline cleanup drive: a group of workers clears debris from the bank while a person on a small boat removes floating waste.",
    tags: ["lake", "cleanup drive", "boat", "workers", "floating debris", "community", "waste"],
    objects: ["people", "boat", "water", "plastic waste", "rakes"],
    activities: ["waste removal", "floating debris removal", "community participation"],
    confidence: 88,
  },
  asset_blr_during_04: {
    description:
      "Saplings protected by wooden tree guards have been planted in a row along the shoreline; workers are tending the new plants.",
    tags: ["plantation", "saplings", "tree guards", "shoreline", "restoration", "vegetation"],
    objects: ["saplings", "tree guards", "people", "shoreline", "water"],
    activities: ["plantation", "shoreline restoration"],
    confidence: 90,
  },
  asset_blr_during_05: {
    description:
      "Workers are clearing debris around the inflow channel, with collected waste sacks placed on the bank beside the channel.",
    tags: ["inflow channel", "drain", "cleaning", "workers", "waste", "sacks"],
    objects: ["people", "concrete channel", "collection sacks", "plastic waste"],
    activities: ["waste removal", "channel clearing"],
    confidence: 86,
  },
  // ── after ──────────────────────────────────────────────
  asset_blr_after_01: {
    description:
      "The same stretch of shoreline shows little visible waste; grass has grown along the bank and the water surface is clearly visible.",
    tags: ["lake", "water", "shoreline", "vegetation", "clean", "environment"],
    objects: ["water", "shoreline", "grass", "vegetation"],
    activities: ["post-project documentation"],
    confidence: 91,
  },
  asset_blr_after_02: {
    description:
      "Saplings with tree guards stand along a well-vegetated shoreline; no significant waste is visible in the frame.",
    tags: ["plantation", "saplings", "vegetation", "shoreline", "restoration", "clean"],
    objects: ["saplings", "tree guards", "grass", "water"],
    activities: ["post-project documentation", "plantation"],
    confidence: 89,
  },
  asset_blr_after_03: {
    description:
      "Wide view of the lake with an open, clear water surface and a small boat; the shoreline appears free of visible debris.",
    tags: ["lake", "water", "landscape", "boat", "shoreline", "clean"],
    objects: ["water", "boat", "tree line", "shoreline", "vegetation"],
    activities: ["post-project documentation"],
    confidence: 88,
  },
  asset_blr_after_04: {
    description:
      "The stone ghat steps appear clear of waste, with a clean water edge beside the steps in evening light.",
    tags: ["lake", "ghat", "steps", "public space", "clean", "water"],
    objects: ["stone steps", "water", "small shrine structure"],
    activities: ["post-project documentation"],
    confidence: 92,
  },
  // ── Community Solar Installation ───────────────────────
  asset_csi_before_01: {
    description: "Village houses with tiled roofs and no rooftop solar equipment visible.",
    tags: ["village", "rooftop", "houses", "site survey", "energy"],
    objects: ["houses", "tiled roofs", "trees"],
    activities: ["site documentation"],
    confidence: 88,
  },
  asset_csi_during_01: {
    description:
      "Technicians are working on a rooftop using a ladder while one neighbouring roof already carries mounted solar panels.",
    tags: ["solar", "installation", "rooftop", "technicians", "energy"],
    objects: ["people", "solar panels", "ladder", "houses"],
    activities: ["panel installation"],
    confidence: 90,
  },
  asset_csi_after_01: {
    description: "Solar panel arrays are mounted on the rooftops of three village houses.",
    tags: ["solar", "rooftop", "panels", "houses", "energy", "completed"],
    objects: ["solar panels", "houses", "roofs"],
    activities: ["post-installation documentation"],
    confidence: 91,
  },
  // ── Village Water Access ───────────────────────────────
  asset_vwa_before_01: {
    description: "A dry hand pump stands in a dusty open area with several water containers placed beside it.",
    tags: ["water", "hand pump", "containers", "village", "access"],
    objects: ["hand pump", "water containers", "houses"],
    activities: ["site documentation"],
    confidence: 87,
  },
  asset_vwa_during_01: {
    description: "Workers are laying a water pipeline along a trench that runs through the village.",
    tags: ["pipeline", "trench", "construction", "workers", "water"],
    objects: ["people", "pipe", "trench", "houses"],
    activities: ["pipeline construction"],
    confidence: 89,
  },
  asset_vwa_after_01: {
    description: "A newly built tap stand with running water; a resident stands beside it and a container sits below the tap.",
    tags: ["water", "tap stand", "access", "village", "completed"],
    objects: ["tap stand", "running water", "water container", "people"],
    activities: ["water collection", "post-project documentation"],
    confidence: 90,
  },
};
