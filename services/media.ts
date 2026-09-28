import "server-only";
import type { CloudinaryUploadInfo, MediaAsset, Phase } from "@/types";
import { assetSrc } from "@/lib/media-url";
import { getRepository } from "./repository";
import { getAIProvider } from "./ai";
import { deliveryUrl, isCloudinaryServerConfigured, verifyAsset } from "./cloudinary";

/** Absolute, model-readable URL for an asset (poster frame for video). */
export function aiInputUrl(asset: MediaAsset, origin: string) {
  if (asset.source === "cloudinary" && asset.cloudinaryPublicId && isCloudinaryServerConfigured) {
    return deliveryUrl(asset.cloudinaryPublicId, asset.resourceType, { width: 1280, posterFrame: asset.resourceType === "video" });
  }
  const src = assetSrc(asset, { poster: true, width: 1280 });
  return src.startsWith("http") ? src : `${origin}${src}`;
}

export async function listProjectMedia(projectId: string) {
  return getRepository().listMedia(projectId);
}

export async function analyzeAsset(assetId: string, origin: string) {
  const repo = getRepository();
  const asset = await repo.getMedia(assetId);
  if (!asset) return null;
  const project = await repo.getProject(asset.projectId);
  const analysis = await getAIProvider().analyzeImage({
    assetId: asset.id,
    imageUrl: aiInputUrl(asset, origin),
    filename: asset.filename,
    resourceType: asset.resourceType,
    context: { projectName: project?.name, projectType: project?.type, location: asset.location, phase: asset.phase, capturedAt: asset.capturedAt },
  });
  const updated = await repo.saveAnalysis(asset.id, analysis);
  return { asset: updated ?? asset, analysis };
}

export interface RegisterUploadInput {
  projectId: string;
  upload: CloudinaryUploadInfo;
  phase?: Phase;
  capturedAt?: string;
  site?: string;
}

/** Cloudinary result -> verified media record -> AI analysis. */
export async function registerUpload(input: RegisterUploadInput, origin: string) {
  const repo = getRepository();
  const project = await repo.getProject(input.projectId);
  if (!project) throw new Error("Project not found");

  // Trust server-side Cloudinary metadata over client-provided values when available.
  const verified = await verifyAsset(input.upload.public_id, input.upload.resource_type).catch(() => null);
  const u = { ...input.upload, ...(verified ?? {}) };
  const resourceType = u.resource_type === "video" ? "video" : "image";
  const ext = u.format ? `.${u.format}` : "";

  const asset = await repo.createMedia({
    projectId: project.id,
    filename: `${input.upload.original_filename ?? u.public_id.split("/").pop()}${ext}`,
    cloudinaryPublicId: u.public_id,
    cloudinaryUrl: u.secure_url,
    resourceType,
    format: u.format ?? "",
    width: u.width ?? 0,
    height: u.height ?? 0,
    duration: u.duration ?? null,
    posterUrl: resourceType === "video" ? u.secure_url.replace(/\.[a-z0-9]+$/i, ".jpg") : undefined,
    phase: input.phase ?? "during",
    capturedAt: input.capturedAt ?? u.created_at ?? new Date().toISOString(),
    location: project.location,
    site: input.site,
    source: "cloudinary",
  });

  const result = await analyzeAsset(asset.id, origin);
  return { asset: result?.asset ?? asset, analysis: result?.analysis ?? null, verified: Boolean(verified) };
}
