import { fail, handleError, ok, originOf, readJson, strField } from "@/lib/api";
import { analyzeAsset } from "@/services/media";

/** Body: { assetId } -> { asset, analysis } */
export async function POST(req: Request) {
  const body = await readJson(req);
  const assetId = body ? strField(body, "assetId") : "";
  if (!assetId) return fail("assetId is required", 422, "validation_error");
  try {
    const result = await analyzeAsset(assetId, originOf(req));
    return result ? ok(result) : fail("Media asset not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "AI analysis failed");
  }
}
