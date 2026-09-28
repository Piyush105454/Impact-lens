import { fail, handleError, ok, readJson } from "@/lib/api";
import { createProject, listProjects, validateProjectInput } from "@/services/projects";

export async function GET() {
  try {
    return ok(await listProjects());
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const v = validateProjectInput(body);
  if (!v.ok) return fail(v.error, 422, "validation_error");
  try {
    return ok(await createProject(v.value), { status: 201 });
  } catch (e) {
    return handleError(e, "Could not create project");
  }
}
