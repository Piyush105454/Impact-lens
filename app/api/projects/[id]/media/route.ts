import { fail, ok } from "@/lib/api";
import { getProject } from "@/services/projects";
import { listProjectMedia } from "@/services/media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getProject(id))) return fail("Project not found", 404, "not_found");
  const url = new URL(req.url);
  const phase = url.searchParams.get("phase");
  const type = url.searchParams.get("type");
  let media = await listProjectMedia(id);
  if (phase) media = media.filter((m) => m.phase === phase);
  if (type) media = media.filter((m) => m.resourceType === type);
  return ok(media);
}
