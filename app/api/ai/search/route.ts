import { fail, handleError, ok, readJson, strField } from "@/lib/api";
import { searchProject } from "@/services/search";

/** Body: { projectId, query } -> { interpretation, results, tookMs, provider } */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Request body must be a JSON object", 400);
  const projectId = strField(body, "projectId");
  const query = strField(body, "query").slice(0, 300);
  if (!projectId) return fail("projectId is required", 422, "validation_error");
  if (query.length < 2) return fail("Enter a longer search query", 422, "validation_error");
  try {
    const r = await searchProject(projectId, query);
    return r ? ok(r) : fail("Project not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "AI search failed");
  }
}
