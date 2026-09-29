import { NextResponse } from "next/server";
import { fail, readJson } from "@/lib/api";
import { isCloudinaryServerConfigured, signUploadParams } from "@/services/cloudinary";

/** Signature endpoint for CldUploadWidget signed uploads. */
export async function POST(req: Request) {
  if (!isCloudinaryServerConfigured) return fail("Signed uploads require CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET", 501, "not_configured");
  const body = await readJson(req);
  const params = body?.paramsToSign;
  if (typeof params !== "object" || params === null) return fail("paramsToSign is required", 422);
  const clean: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) if (typeof v === "string" || typeof v === "number") clean[k] = v;
  // Constrain uploads to the ImpactLens folder only when folder is explicitly provided.
  if (typeof clean.folder === "string" && clean.folder !== "" && !clean.folder.startsWith("impactlens")) {
    return fail("Uploads must target the impactlens folder", 403);
  }
  return NextResponse.json({ signature: signUploadParams(clean) });
}
