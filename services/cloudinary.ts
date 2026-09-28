import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { publicConfig } from "@/lib/config";
import { serverEnv } from "@/lib/env.server";
import type { CloudinaryUploadInfo } from "@/types";

export const isCloudinaryServerConfigured = Boolean(publicConfig.cloudinaryCloudName && serverEnv.cloudinaryApiKey && serverEnv.cloudinaryApiSecret);

let configured = false;
function client() {
  if (!isCloudinaryServerConfigured) throw new Error("Cloudinary server credentials are not configured");
  if (!configured) {
    cloudinary.config({
      cloud_name: publicConfig.cloudinaryCloudName,
      api_key: serverEnv.cloudinaryApiKey,
      api_secret: serverEnv.cloudinaryApiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** Signs upload widget parameters. The API secret never leaves the server. */
export function signUploadParams(paramsToSign: Record<string, string | number>) {
  const c = client();
  return c.utils.api_sign_request(paramsToSign, serverEnv.cloudinaryApiSecret);
}

/**
 * Confirms an uploaded asset exists in our Cloudinary account before we
 * create a media record for it. Returns null when verification is not possible.
 */
export async function verifyAsset(publicId: string, resourceType: string): Promise<CloudinaryUploadInfo | null> {
  if (!isCloudinaryServerConfigured) return null;
  const r = (await client().api.resource(publicId, { resource_type: resourceType === "video" ? "video" : "image" })) as Record<string, unknown>;
  return {
    public_id: String(r.public_id),
    secure_url: String(r.secure_url),
    resource_type: String(r.resource_type),
    format: typeof r.format === "string" ? r.format : undefined,
    width: typeof r.width === "number" ? r.width : undefined,
    height: typeof r.height === "number" ? r.height : undefined,
    duration: typeof r.duration === "number" ? r.duration : undefined,
    bytes: typeof r.bytes === "number" ? r.bytes : undefined,
    created_at: typeof r.created_at === "string" ? r.created_at : undefined,
  };
}

/** Optimized delivery URL (auto format/quality), usable server-side for AI input. */
export function deliveryUrl(publicId: string, resourceType: "image" | "video", opts: { width?: number; posterFrame?: boolean } = {}) {
  const cloud = publicConfig.cloudinaryCloudName;
  const t = ["f_auto", "q_auto", opts.width ? `w_${opts.width},c_limit` : ""].filter(Boolean).join(",");
  if (resourceType === "video" && opts.posterFrame) return `https://res.cloudinary.com/${cloud}/video/upload/so_0,${t}/${publicId}.jpg`;
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${t}/${publicId}`;
}

export function isValidUploadInfo(v: unknown): v is CloudinaryUploadInfo {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.public_id === "string" && typeof o.secure_url === "string" && /^https:\/\/res\.cloudinary\.com\//.test(o.secure_url);
}
