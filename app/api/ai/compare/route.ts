import { fail, handleError, ok, originOf, readJson, strField } from "@/lib/api";
import { compareAssets } from "@/services/comparisons";

/** Body: { projectId, beforeAssetId, afterAssetId } -> Comparison */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Request body must be a JSON object", 400);
  const projectId = strField(body, "projectId");
  const beforeAssetId = strField(body, "beforeAssetId");
  const afterAssetId = strField(body, "afterAssetId");
  if (!projectId || !beforeAssetId || !afterAssetId) return fail("projectId, beforeAssetId and afterAssetId are required", 422, "validation_error");
  if (beforeAssetId === afterAssetId) return fail("Choose two different assets to compare", 422, "validation_error");
  try {
    const c = await compareAssets(projectId, beforeAssetId, afterAssetId, originOf(req));
    return c ? ok(c) : fail("Project or media asset not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "AI comparison failed");
  }
}
