import { fail, handleError, originOf } from "@/lib/api";
import { getReport, reportContext } from "@/services/reports";
import { renderReportPdf } from "@/services/pdf";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const report = await getReport(id);
    if (!report) return fail("Report not found", 404, "not_found");
    const { project, assets } = await reportContext(report);
    if (!project) return fail("Project not found", 404, "not_found");
    const pdf = await renderReportPdf(report, project, assets, originOf(req));
    const filename = `${project.name.replace(/[^a-z0-9]+/gi, "-")}-Impact-Report.pdf`;
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleError(e, "Could not generate PDF");
  }
}
