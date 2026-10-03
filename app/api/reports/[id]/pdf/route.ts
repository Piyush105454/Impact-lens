import { NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { getReport } from "@/services/reports";
import { getProjectBundle } from "@/services/projects";
import { formatDate, formatDateTime, formatPeriod, titleCase } from "@/lib/utils";
import { assetSrc } from "@/lib/media-url";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return fail("Report not found", 404, "not_found");

  const bundle = await getProjectBundle(report.projectId);
  if (!bundle) return fail("Project not found", 404, "not_found");

  const { project, media } = bundle;
  const byId = new Map(media.map((a) => [a.id, a]));
  const sources = report.sourceAssetIds.map((assetId) => byId.get(assetId)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const before = report.comparison ? byId.get(report.comparison.beforeAssetId) : undefined;
  const after = report.comparison ? byId.get(report.comparison.afterAssetId) : undefined;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${report.title} - Impact Report</title>
  <style>
    @page { size: A4; margin: 15mm; }
    *, *:before, *:after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111827; line-height: 1.5; font-size: 13px; margin: 0; padding: 20px; }
    .header { border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 26px; font-weight: 700; color: #064e3b; margin: 0 0 4px 0; }
    .subtitle { color: #6b7280; font-size: 13px; margin: 0; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 11px; text-transform: uppercase; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    .section-title { font-size: 16px; font-weight: 700; color: #064e3b; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #f9fafb; }
    .media-img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; display: block; }
    .timeline-item { border-left: 3px solid #22c55e; padding-left: 12px; margin-bottom: 16px; page-break-inside: avoid; }
    .timeline-date { font-weight: 700; color: #15803d; font-size: 12px; }
    .table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    .table th, .table td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
    .table th { background: #f3f4f6; font-weight: 600; }
    .ai-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 10px; color: #166534; margin-top: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #22c55e; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">${project.name}</h1>
      <p class="subtitle">${project.location} • ${formatPeriod(project.startDate, project.endDate)}</p>
      <p class="subtitle" style="margin-top: 4px;">Report Ref: ${report.id} • Generated ${formatDateTime(report.generatedAt)}</p>
    </div>
    <div>
      <span class="badge">ImpactLens Verified</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. Project Overview</div>
    <p>${report.overview}</p>
  </div>

  <div class="section">
    <div class="section-title">2. Key Project Metrics & Timeline Summary</div>
    <div class="grid-3">
      <div class="card">
        <strong>Project Type</strong><br>${project.type}
      </div>
      <div class="card">
        <strong>Status</strong><br>${titleCase(project.status)}
      </div>
      <div class="card">
        <strong>Source Assets</strong><br>${sources.length} Verified Media Assets
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Visual Timeline Stages & AI Analysis</div>
    ${report.timeline.map((t) => {
      const stageAssets = t.assetIds.map(id => byId.get(id)).filter(Boolean);
      return `
        <div class="timeline-item">
          <div class="timeline-date">${formatDate(t.date)} - ${t.title} (${titleCase(t.phase)} Phase)</div>
          <p style="margin: 4px 0 8px 0; font-size: 12px; color: #374151;">${t.aiSummary}</p>
          ${stageAssets.length ? `
            <div class="grid-3" style="margin-top: 8px;">
              ${stageAssets.slice(0, 3).map(a => `
                <div>
                  <img src="${assetSrc(a!, { width: 400, poster: true })}" class="media-img" alt="" />
                  <p style="font-size: 10px; color: #6b7280; margin-top: 4px;">${a!.filename} (${a!.confidence}% confidence)</p>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      `;
    }).join("")}
  </div>

  ${report.comparison && before && after ? `
    <div class="section">
      <div class="section-title">4. Before & After Evidence Comparison</div>
      <div class="grid-2">
        <div class="card">
          <strong style="color: #d97706;">BEFORE (${formatDate(before.capturedAt)})</strong>
          <img src="${assetSrc(before, { width: 600, poster: true })}" class="media-img" style="margin-top: 8px; height: 180px;" alt="" />
          <p style="font-size: 11px; margin-top: 6px;">${before.description || before.filename}</p>
        </div>
        <div class="card">
          <strong style="color: #16a34a;">AFTER (${formatDate(after.capturedAt)})</strong>
          <img src="${assetSrc(after, { width: 600, poster: true })}" class="media-img" style="margin-top: 8px; height: 180px;" alt="" />
          <p style="font-size: 11px; margin-top: 6px;">${after.description || after.filename}</p>
        </div>
      </div>
    </div>
  ` : ""}

  <div class="section">
    <div class="section-title">5. AI Summary & Key Observed Changes</div>
    <div class="ai-box">
      <strong>AI Impact Summary:</strong>
      <p style="margin: 6px 0 0 0; font-size: 13px;">${report.summary}</p>
    </div>
    <ul style="margin-top: 10px; padding-left: 20px;">
      ${report.observedChanges.map((change) => `<li>${change}</li>`).join("")}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">6. Source Asset Evidence Table</div>
    <table class="table">
      <thead>
        <tr>
          <th>Filename</th>
          <th>Public ID</th>
          <th>Captured Date</th>
          <th>Phase</th>
          <th>Location</th>
          <th>AI Confidence</th>
        </tr>
      </thead>
      <tbody>
        ${sources.map((a) => `
          <tr>
            <td>${a.filename}</td>
            <td><code>${a.cloudinaryPublicId}</code></td>
            <td>${formatDate(a.capturedAt)}</td>
            <td>${titleCase(a.phase)}</td>
            <td>${a.site || a.location}</td>
            <td>${a.confidence}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog for instant PDF download
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
