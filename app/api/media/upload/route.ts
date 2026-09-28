import { fail, handleError, ok, originOf, readJson, strField } from "@/lib/api";
import { isValidUploadInfo } from "@/services/cloudinary";
import { registerUpload } from "@/services/media";
import type { Phase } from "@/types";

/**
 * Registers a completed Cloudinary upload: verifies the asset, creates the
 * media record, and runs AI analysis. Body: { projectId, upload, phase?, capturedAt?, site? }
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Request body must be a JSON object", 400);
  const projectId = strField(body, "projectId");
  if (!projectId) return fail("projectId is required", 422, "validation_error");
  if (!isValidUploadInfo(body.upload)) return fail("upload must be a Cloudinary upload result with public_id and secure_url", 422, "invalid_upload");
  const phaseRaw = strField(body, "phase");
  const phase = (["before", "during", "after"] as const).includes(phaseRaw as Phase) ? (phaseRaw as Phase) : undefined;
  try {
    const result = await registerUpload({ projectId, upload: body.upload, phase, capturedAt: strField(body, "capturedAt") || undefined, site: strField(body, "site") || undefined }, originOf(req));
    return ok(result, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Project not found") return fail(e.message, 404, "not_found");
    return handleError(e, "Could not register upload");
  }
}
