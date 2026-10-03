import { fail, handleError, ok } from "@/lib/api";
import { deleteMedia } from "@/services/media";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return fail("id is required", 422, "validation_error");
  try {
    const deleted = await deleteMedia(id);
    return deleted ? ok({ deleted: true }) : fail("Media not found", 404, "not_found");
  } catch (e) {
    return handleError(e, "Could not delete media asset");
  }
}
