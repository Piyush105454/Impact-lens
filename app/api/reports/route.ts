import { fail, handleError, ok, readJson, strField } from "@/lib/api";
import { generateProjectReport, listReports } from "@/services/reports";

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  return ok(await listReports(projectId));
}

/** Creates and stores a report for a project. Body: { projectId } */
export async function POST(req: Request) {
  const body = await readJson(req);
  const projectId = body ? strField(body, "projectId") : "";
  if (!projectId) return fail("projectId is required", 422, "validation_error");
  try {
    const report = await generateProjectReport(projectId);
    return report ? ok(report, { status: 201 }) : fail("Project not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "Report generation failed");
  }
}
