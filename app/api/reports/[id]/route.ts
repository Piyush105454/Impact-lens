import { fail, ok } from "@/lib/api";
import { getReport } from "@/services/reports";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  return report ? ok(report) : fail("Report not found", 404, "not_found");
}
