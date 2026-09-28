import type { MediaAsset, Phase, ResourceType } from "@/types";
import { demoAnalysis } from "./demoAnalysis";

interface FileSeed {
  id: string;
  projectId: string;
  file: string; // file stem in /public/demo
  folder: string; // Cloudinary folder
  phase: Phase;
  capturedAt: string;
  site: string;
  location: string;
  resourceType?: ResourceType;
  duration?: number;
}

const BHOPAL = "Bhopal, Madhya Pradesh";
const SEHORE = "Sehore, Madhya Pradesh";
const RAISEN = "Raisen, Madhya Pradesh";

const files: FileSeed[] = [
  { id: "asset_blr_before_01", projectId: "bhopal-lake-restoration", file: "lake-before-01", folder: "impactlens/bhopal-lake/before", phase: "before", capturedAt: "2026-03-18T07:42:00+05:30", site: "Shoreline Sector A", location: BHOPAL },
  { id: "asset_blr_before_02", projectId: "bhopal-lake-restoration", file: "lake-before-02", folder: "impactlens/bhopal-lake/before", phase: "before", capturedAt: "2026-03-20T08:15:00+05:30", site: "Ghat 2", location: BHOPAL },
  { id: "asset_blr_before_03", projectId: "bhopal-lake-restoration", file: "lake-before-03", folder: "impactlens/bhopal-lake/before", phase: "before", capturedAt: "2026-03-24T11:05:00+05:30", site: "Shoreline Sector B", location: BHOPAL },
  { id: "asset_blr_before_04", projectId: "bhopal-lake-restoration", file: "lake-before-04", folder: "impactlens/bhopal-lake/before", phase: "before", capturedAt: "2026-03-27T09:30:00+05:30", site: "Inflow Channel 1", location: BHOPAL },
  { id: "asset_blr_during_01", projectId: "bhopal-lake-restoration", file: "lake-during-01", folder: "impactlens/bhopal-lake/during", phase: "during", capturedAt: "2026-04-06T07:55:00+05:30", site: "Shoreline Sector A", location: BHOPAL },
  { id: "asset_blr_during_02", projectId: "bhopal-lake-restoration", file: "lake-during-02", folder: "impactlens/bhopal-lake/during", phase: "during", capturedAt: "2026-04-14T12:20:00+05:30", site: "Collection Point C", location: BHOPAL },
  { id: "asset_blr_during_03", projectId: "bhopal-lake-restoration", file: "lake-during-03", folder: "impactlens/bhopal-lake/during", phase: "during", capturedAt: "2026-04-21T08:10:00+05:30", site: "Shoreline Sector B", location: BHOPAL, resourceType: "video", duration: 6 },
  { id: "asset_blr_during_04", projectId: "bhopal-lake-restoration", file: "lake-during-04", folder: "impactlens/bhopal-lake/during", phase: "during", capturedAt: "2026-05-08T17:40:00+05:30", site: "Shoreline Sector D", location: BHOPAL },
  { id: "asset_blr_during_05", projectId: "bhopal-lake-restoration", file: "lake-during-05", folder: "impactlens/bhopal-lake/during", phase: "during", capturedAt: "2026-05-19T10:45:00+05:30", site: "Inflow Channel 1", location: BHOPAL },
  { id: "asset_blr_after_01", projectId: "bhopal-lake-restoration", file: "lake-after-01", folder: "impactlens/bhopal-lake/after", phase: "after", capturedAt: "2026-06-10T07:38:00+05:30", site: "Shoreline Sector A", location: BHOPAL },
  { id: "asset_blr_after_02", projectId: "bhopal-lake-restoration", file: "lake-after-02", folder: "impactlens/bhopal-lake/after", phase: "after", capturedAt: "2026-06-14T11:50:00+05:30", site: "Shoreline Sector D", location: BHOPAL },
  { id: "asset_blr_after_03", projectId: "bhopal-lake-restoration", file: "lake-after-03", folder: "impactlens/bhopal-lake/after", phase: "after", capturedAt: "2026-06-20T11:12:00+05:30", site: "Shoreline Sector B", location: BHOPAL },
  { id: "asset_blr_after_04", projectId: "bhopal-lake-restoration", file: "lake-after-04", folder: "impactlens/bhopal-lake/after", phase: "after", capturedAt: "2026-06-24T18:05:00+05:30", site: "Ghat 2", location: BHOPAL },

  { id: "asset_csi_before_01", projectId: "community-solar-installation", file: "solar-before-01", folder: "impactlens/sehore-solar/before", phase: "before", capturedAt: "2026-02-12T12:10:00+05:30", site: "Ward 4 rooftops", location: SEHORE },
  { id: "asset_csi_during_01", projectId: "community-solar-installation", file: "solar-during-01", folder: "impactlens/sehore-solar/during", phase: "during", capturedAt: "2026-04-03T09:25:00+05:30", site: "Ward 4 rooftops", location: SEHORE },
  { id: "asset_csi_after_01", projectId: "community-solar-installation", file: "solar-after-01", folder: "impactlens/sehore-solar/after", phase: "after", capturedAt: "2026-06-18T17:30:00+05:30", site: "Ward 4 rooftops", location: SEHORE },

  { id: "asset_vwa_before_01", projectId: "village-water-access", file: "water-before-01", folder: "impactlens/raisen-water/before", phase: "before", capturedAt: "2026-01-22T10:40:00+05:30", site: "Hamlet water point", location: RAISEN },
  { id: "asset_vwa_during_01", projectId: "village-water-access", file: "water-during-01", folder: "impactlens/raisen-water/during", phase: "during", capturedAt: "2026-04-11T11:15:00+05:30", site: "Main lane", location: RAISEN },
  { id: "asset_vwa_after_01", projectId: "village-water-access", file: "water-after-01", folder: "impactlens/raisen-water/after", phase: "after", capturedAt: "2026-07-02T08:05:00+05:30", site: "Tap stand 3", location: RAISEN },
];

export const demoMedia: MediaAsset[] = files.map((f) => {
  const a = demoAnalysis[f.id];
  const isVideo = f.resourceType === "video";
  return {
    id: f.id,
    projectId: f.projectId,
    filename: `${f.file}.${isVideo ? "mp4" : "jpg"}`,
    cloudinaryPublicId: `${f.folder}/${f.file}`,
    // Demo workspace assets are mirrored locally in /public/demo so the demo
    // never depends on network access. Run `npm run seed:cloudinary` to host them.
    cloudinaryUrl: `/demo/${f.file}.${isVideo ? "mp4" : "jpg"}`,
    posterUrl: isVideo ? `/demo/${f.file}.jpg` : undefined,
    resourceType: f.resourceType ?? "image",
    format: isVideo ? "mp4" : "jpg",
    width: isVideo ? 960 : 1280,
    height: isVideo ? 600 : 800,
    duration: f.duration ?? null,
    phase: f.phase,
    capturedAt: f.capturedAt,
    location: f.location,
    site: f.site,
    tags: a.tags,
    objects: a.objects,
    activities: a.activities,
    description: a.description,
    confidence: a.confidence,
    analyzed: true,
    source: "demo",
  } satisfies MediaAsset;
});

export function demoMediaForProject(projectId: string): MediaAsset[] {
  return demoMedia.filter((m) => m.projectId === projectId);
}
