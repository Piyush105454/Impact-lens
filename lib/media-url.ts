import type { MediaAsset } from "@/types";
import { publicConfig } from "./config";

interface UrlOpts {
  width?: number;
  poster?: boolean;
}

/**
 * Resolves a displayable URL for an asset.
 * - Cloudinary uploads get an optimized delivery URL (f_auto, q_auto, width).
 * - Demo assets are served from /public/demo, or from Cloudinary once seeded.
 */
export function assetSrc(asset: Pick<MediaAsset, "source" | "cloudinaryUrl" | "cloudinaryPublicId" | "resourceType" | "posterUrl">, opts: UrlOpts = {}) {
  const cloud = publicConfig.cloudinaryCloudName;
  const wantsPoster = opts.poster && asset.resourceType === "video";
  const fromCloudinary = asset.source === "cloudinary" || (publicConfig.demoAssetsFromCloudinary && Boolean(cloud));

  if (fromCloudinary && cloud) {
    const t = ["f_auto", "q_auto", opts.width ? `w_${opts.width},c_limit` : ""].filter(Boolean).join(",");
    if (wantsPoster) return `https://res.cloudinary.com/${cloud}/video/upload/so_0,${t}/${asset.cloudinaryPublicId}.jpg`;
    return `https://res.cloudinary.com/${cloud}/${asset.resourceType}/upload/${t}/${asset.cloudinaryPublicId}`;
  }
  if (wantsPoster) return asset.posterUrl ?? asset.cloudinaryUrl;
  return asset.cloudinaryUrl;
}
