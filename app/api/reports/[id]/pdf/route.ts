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
  const phases = new Set(sources.map((a) => a.phase));
  const avgConfidence = sources.length ? Math.round(sources.reduce((s, a) => s + a.confidence, 0) / sources.length) : 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${project.name} - Impact Report</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *:before, *:after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #1f2937; line-height: 1.5; font-size: 13px; margin: 0; padding: 0; }
    .page-container { padding: 0; width: 100%; max-width: 900px; margin: 0 auto; background: #fff; }
    
    /* Dark Emerald Banner Header */
    .banner { background: #0B281B; color: #ffffff; padding: 40px 44px 32px 44px; position: relative; }
    .banner-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .logo-brand { display: flex; items-center: center; gap: 10px; font-weight: 700; font-size: 20px; letter-spacing: -0.5px; color: #ffffff; }
    .logo-icon { width: 22px; height: 22px; background: #22C55E; border-radius: 50%; display: inline-block; border: 3px solid #0B281B; }
    .banner-tagline { color: #9CA3AF; font-size: 12px; font-weight: 500; }
    .report-badge { color: #4ADE80; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .banner-title { font-family: Georgia, Cambria, "Times New Roman", Times, serif; font-size: 34px; font-weight: 700; line-height: 1.15; color: #ffffff; margin: 0 0 10px 0; }
    .banner-meta { color: #D1D5DB; font-size: 14px; margin: 0 0 20px 0; }
    .banner-submeta { color: rgba(255, 255, 255, 0.65); font-size: 11px; font-family: monospace; }
    
    /* Main Content Padding */
    .content { padding: 36px 44px; }
    
    /* Section Headers with Vertical Green Accent Bar */
    .section { margin-bottom: 32px; page-break-inside: avoid; }
    .section-title { font-size: 18px; font-weight: 700; color: #111827; border-left: 4px solid #22C55E; padding-left: 10px; margin-bottom: 14px; display: flex; align-items: center; }
    
    /* Project Details Striped Table */
    .details-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; margin-top: 8px; }
    .details-table tr:nth-child(odd) { background: #F4FBF7; }
    .details-table tr:nth-child(even) { background: #FFFFFF; }
    .details-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #E5E7EB; }
    .details-label { color: #4B5563; font-weight: 500; width: 35%; }
    .details-value { color: #111827; font-weight: 600; }
    
    /* Grid Layouts */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; background: #FAFAFA; }
    .media-img { width: 100%; height: 170px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; display: block; }
    
    /* Timeline Stages */
    .timeline-item { border-left: 3px solid #22C55E; padding-left: 14px; margin-bottom: 20px; page-break-inside: avoid; }
    .timeline-header { font-weight: 700; color: #15803D; font-size: 13px; display: flex; items-center: center; gap: 8px; }
    .timeline-badge { background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
    .timeline-summary { margin: 6px 0 10px 0; font-size: 12px; color: #374151; line-height: 1.5; }
    
    /* AI Box Callout */
    .ai-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; color: #166534; margin-top: 10px; }
    
    /* Evidence Table */
    .table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    .table th, .table td { border: 1px solid #E5E7EB; padding: 8px 10px; text-align: left; }
    .table th { background: #F3F4F6; font-weight: 600; color: #374151; }
    
    /* Print Styles */
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .details-table tr:nth-child(odd) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .ai-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .timeline-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="padding: 16px 44px; background: #081d13; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <button onclick="window.print()" style="background: #22C55E; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">
      🖨️ Save as PDF / Print
    </button>
  </div>

  <div class="page-container">
    <!-- Dark Emerald Header Banner -->
    <div class="banner">
      <div class="banner-top">
        <div class="logo-brand">
          <span class="logo-icon"></span> ImpactLens
        </div>
        <div class="banner-tagline">Turn Field Media Into Measurable Impact</div>
      </div>
      <div class="report-badge">Impact Report</div>
      <h1 class="banner-title">${project.name}</h1>
      <div class="banner-meta">${project.location} &nbsp;|&nbsp; ${formatPeriod(project.startDate, project.endDate)}</div>
      <div class="banner-submeta">
        Generated ${formatDate(report.generatedAt)} &nbsp;|&nbsp; Report ${report.id} &nbsp;|&nbsp; ${sources.length} source assets
      </div>
    </div>

    <!-- Main Content Body -->
    <div class="content">
      <!-- Section 1: Project Overview -->
      <div class="section">
        <div class="section-title">Project Overview</div>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">${report.overview}</p>
      </div>

      <!-- Section 2: Project Details Table -->
      <div class="section">
        <div class="section-title">Project Details</div>
        <table class="details-table">
          <tbody>
            <tr>
              <td class="details-label">Project type</td>
              <td class="details-value">${project.type}</td>
            </tr>
            <tr>
              <td class="details-label">Location</td>
              <td class="details-value">${project.location}</td>
            </tr>
            <tr>
              <td class="details-label">Project period</td>
              <td class="details-value">${formatPeriod(project.startDate, project.endDate)}</td>
            </tr>
            <tr>
              <td class="details-label">Status</td>
              <td class="details-value">${titleCase(project.status)}</td>
            </tr>
            <tr>
              <td class="details-label">Media assets</td>
              <td class="details-value">${sources.length} (${avgConfidence}% AI analyzed)</td>
            </tr>
            <tr>
              <td class="details-label">Project phases</td>
              <td class="details-value">${phases.size}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 3: Visual Timeline Stages & AI Analysis -->
      <div class="section">
        <div class="section-title">Visual Timeline Stages & AI Analysis</div>
        ${report.timeline.map((t) => {
          const stageAssets = t.assetIds.map(id => byId.get(id)).filter(Boolean);
          return `
            <div class="timeline-item">
              <div class="timeline-header">
                ${formatDate(t.date)} &mdash; ${t.title}
                <span class="timeline-badge">${titleCase(t.phase)}</span>
              </div>
              <div class="timeline-summary">${t.aiSummary}</div>
              ${stageAssets.length ? `
                <div class="grid-3" style="margin-top: 10px;">
                  ${stageAssets.slice(0, 3).map(a => `
                    <div>
                      <img src="${assetSrc(a!, { width: 500, poster: true })}" class="media-img" alt="" />
                      <p style="font-size: 10px; color: #6B7280; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a!.filename}</p>
                    </div>
                  `).join("")}
                </div>
              ` : ""}
            </div>
          `;
        }).join("")}
      </div>

      <!-- Section 4: Before & After Evidence Comparison -->
      ${report.comparison && before && after ? `
        <div class="section page-break">
          <div class="section-title">Before & After Evidence Comparison</div>
          <div class="grid-2">
            <div class="card">
              <div style="font-weight: 700; color: #D97706; margin-bottom: 6px; font-size: 12px;">BEFORE (${formatDate(before.capturedAt)})</div>
              <img src="${assetSrc(before, { width: 700, poster: true })}" class="media-img" style="height: 200px;" alt="" />
              <p style="font-size: 11px; margin-top: 6px; color: #4B5563;">${before.description || before.filename}</p>
            </div>
            <div class="card">
              <div style="font-weight: 700; color: #16A34A; margin-bottom: 6px; font-size: 12px;">AFTER (${formatDate(after.capturedAt)})</div>
              <img src="${assetSrc(after, { width: 700, poster: true })}" class="media-img" style="height: 200px;" alt="" />
              <p style="font-size: 11px; margin-top: 6px; color: #4B5563;">${after.description || after.filename}</p>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Section 5: AI Impact Summary & Observed Changes -->
      <div class="section">
        <div class="section-title">AI Summary & Key Observed Changes</div>
        <div class="ai-box">
          <strong style="font-size: 13px;">AI Executive Impact Summary:</strong>
          <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.5; color: #14532D;">${report.summary}</p>
        </div>
        <ul style="margin-top: 12px; padding-left: 20px; font-size: 13px; color: #374151;">
          ${report.observedChanges.map((change) => `<li style="margin-bottom: 4px;">${change}</li>`).join("")}
        </ul>
      </div>

      <!-- Section 6: Source Asset Evidence Table -->
      <div class="section">
        <div class="section-title">Source Asset Evidence Table</div>
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
                <td><strong>${a.filename}</strong></td>
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
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
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
