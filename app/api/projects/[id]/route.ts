import { fail, handleError, ok, readJson } from "@/lib/api";
import { deleteProject, getProject, updateProject } from "@/services/projects";
import type { UpdateProjectInput } from "@/services/repository/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const project = await getProject(id);
  return project ? ok(project) : fail("Project not found", 404, "not_found");
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return fail("Request body must be a JSON object", 400);
  const allowed = ["name", "description", "type", "location", "startDate", "endDate", "status", "focusActivity"] as const;
  const patch: UpdateProjectInput = {};
  for (const k of allowed) if (typeof body[k] === "string") (patch as Record<string, string>)[k] = (body[k] as string).trim();
  if (patch.name !== undefined && patch.name.length < 3) return fail("Project name must be at least 3 characters", 422, "validation_error");
  if (patch.status && !["active", "completed", "planning"].includes(patch.status)) return fail("Invalid status", 422, "validation_error");
  try {
    const updated = await updateProject(id, patch);
    return updated ? ok(updated) : fail("Project not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "Could not update project");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    return (await deleteProject(id)) ? ok({ id, deleted: true }) : fail("Project not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "Could not delete project");
  }
}
