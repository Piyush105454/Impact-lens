import "server-only";
import { jsPDF } from "jspdf";
import type { MediaAsset, Project, Report } from "@/types";
import { publicConfig } from "@/lib/config";
import { formatDate, formatMonth, formatPeriod, formatShortDate, PHASE_LABEL } from "@/lib/utils";

const C = {
  ink: [18, 32, 26] as const,
  body: [52, 64, 58] as const,
  muted: [120, 134, 127] as const,
  green: [22, 163, 74] as const,
  deep: [13, 27, 21] as const,
  line: [214, 222, 218] as const,
  tint: [236, 246, 240] as const,
  amber: [190, 130, 30] as const,
  sky: [40, 130, 175] as const,
};
const PHASE_RGB = { before: C.amber, during: C.sky, after: C.green } as const;

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18;
const CW = PAGE_W - M * 2;
const BOTTOM = PAGE_H - 22;

/** Standard PDF fonts are WinAnsi; normalize typography that may not map. */
function t(s: string) {
  return s.replace(/[\u2013\u2014]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u2026/g, "...").replace(/[^\x20-\x7E\n]/g, "");
}

function pdfImageUrl(a: MediaAsset, origin: string) {
  const cloud = publicConfig.cloudinaryCloudName;
  const fromCloud = cloud && (a.source === "cloudinary" || publicConfig.demoAssetsFromCloudinary);
  if (fromCloud) {
    return a.resourceType === "video"
      ? `https://res.cloudinary.com/${cloud}/video/upload/so_0,f_jpg,q_80,w_900/${a.cloudinaryPublicId}.jpg`
      : `https://res.cloudinary.com/${cloud}/image/upload/f_jpg,q_80,w_900/${a.cloudinaryPublicId}`;
  }
  const src = a.resourceType === "video" ? a.posterUrl ?? a.cloudinaryUrl : a.cloudinaryUrl;
  return src.startsWith("http") ? src : `${origin}${src}`;
}

async function loadImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/jpe?g/.test(type)) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderReportPdf(report: Report, project: Project, assets: MediaAsset[], origin: string): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const byId = new Map(assets.map((a) => [a.id, a]));
  const imageIds = new Set([...report.evidence.map((e) => e.assetId), ...(report.comparison ? [report.comparison.beforeAssetId, report.comparison.afterAssetId] : [])]);
  const images = new Map<string, string | null>();
  await Promise.all(
    [...imageIds].map(async (id) => {
      const a = byId.get(id);
      images.set(id, a ? await loadImage(pdfImageUrl(a, origin)) : null);
    }),
  );

  let y = 0;
  const color = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

  const newPage = () => {
    doc.addPage();
    y = M + 4;
  };
  const ensure = (h: number) => {
    if (y + h > BOTTOM) newPage();
  };
  const para = (text: string, size = 10, c: readonly number[] = C.body, lh = 5) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    color(c);
    const lines = doc.splitTextToSize(t(text), CW) as string[];
    for (const line of lines) {
      ensure(lh);
      doc.text(line, M, y);
      y += lh;
    }
  };
  /** keep: space needed after the heading so it is never orphaned at a page end. */
  const heading = (text: string, keep = 18) => {
    ensure(keep);
    y += 4;
    fill(C.green);
    doc.rect(M, y - 4.2, 1.4, 5.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    color(C.ink);
    doc.text(t(text), M + 4, y);
    y += 7;
  };
  const drawImage = (id: string, x: number, top: number, w: number, h: number) => {
    const data = images.get(id);
    if (data) {
      doc.addImage(data, "JPEG", x, top, w, h, undefined, "FAST");
    } else {
      fill(C.tint);
      doc.rect(x, top, w, h, "F");
      doc.setFontSize(8);
      color(C.muted);
      doc.text("Media preview unavailable", x + w / 2, top + h / 2, { align: "center" });
    }
  };

  // ── Cover band ───────────────────────────────────────────
  fill(C.deep);
  doc.rect(0, 0, PAGE_W, 74, "F");
  fill(C.green);
  doc.circle(M + 3.2, 17, 3.2, "F");
  fill(C.deep);
  doc.circle(M + 3.2, 17, 1.4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(245, 247, 246);
  doc.text("ImpactLens", M + 9, 18.4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 155);
  doc.text("Turn Field Media Into Measurable Impact", PAGE_W - M, 18.4, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(134, 239, 172);
  doc.text("Impact Report", M, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(245, 247, 246);
  doc.text(t(project.name), M, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 205);
  doc.text(t(`${project.location}   |   ${formatPeriod(project.startDate, project.endDate)}`), M, 52);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 155);
  doc.text(t(`Generated ${formatDate(report.generatedAt)}   |   Report ${report.id}   |   ${report.sourceAssetIds.length} source assets`), M, 64);
  y = 88;

  heading("Project Overview");
  para(report.overview);

  heading("Project Details");
  const details: [string, string][] = [
    ["Project type", project.type],
    ["Location", project.location],
    ["Project period", formatPeriod(project.startDate, project.endDate)],
    ["Status", project.status[0].toUpperCase() + project.status.slice(1)],
    ["Media assets", `${project.stats.mediaAssets} (${project.stats.analyzedPercent}% AI analyzed)`],
    ["Project phases", String(project.stats.phases)],
  ];
  doc.setFontSize(9.5);
  details.forEach(([k, v], i) => {
    ensure(7);
    if (i % 2 === 0) {
      fill(C.tint);
      doc.rect(M, y - 4.6, CW, 7, "F");
    }
    doc.setFont("helvetica", "bold");
    color(C.muted);
    doc.text(t(k), M + 3, y);
    doc.setFont("helvetica", "normal");
    color(C.ink);
    doc.text(t(v), M + 48, y);
    y += 7;
  });

  if (report.keyActivities.length) {
    heading("Key Activities");
    report.keyActivities.forEach((k) => {
      ensure(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      color(C.ink);
      doc.text(t(k.name), M, y);
      if (k.assetCount) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        color(C.green);
        doc.text(`${k.assetCount} evidence asset${k.assetCount === 1 ? "" : "s"}`, PAGE_W - M, y, { align: "right" });
      }
      y += 5;
      para(k.description, 9.5, C.body, 4.6);
      y += 2;
    });
  }

  if (report.timeline.length) {
    heading("Timeline");
    report.timeline.forEach((ev, i) => {
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(t(ev.aiSummary), CW - 36) as string[];
      const h = 10 + lines.length * 4.6;
      ensure(h);
      const pc = PHASE_RGB[ev.phase];
      fill(pc);
      doc.circle(M + 2, y - 1.2, 1.6, "F");
      if (i < report.timeline.length - 1) {
        stroke(C.line);
        doc.setLineWidth(0.4);
        doc.line(M + 2, y + 1.5, M + 2, y + h - 2);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      color(C.muted);
      doc.text(t(formatMonth(ev.date)), M + 7, y);
      doc.setFontSize(10.5);
      color(C.ink);
      doc.text(t(ev.title), M + 36, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      color(C.muted);
      doc.text(`${ev.mediaCount} media`, PAGE_W - M, y, { align: "right" });
      y += 5;
      doc.setFontSize(9.5);
      color(C.body);
      lines.forEach((l) => {
        doc.text(l, M + 36, y);
        y += 4.6;
      });
      y += 4;
    });
  }

  if (report.comparison) {
    const cmp = report.comparison;
    const before = byId.get(cmp.beforeAssetId);
    const after = byId.get(cmp.afterAssetId);
    heading("Before & After");
    para(cmp.title, 9.5, C.muted);
    y += 1;
    const w = (CW - 6) / 2;
    const h = w * 0.625;
    ensure(h + 18);
    [before, after].forEach((a, i) => {
      if (!a) return;
      const x = M + i * (w + 6);
      drawImage(a.id, x, y, w, h);
      fill(i === 0 ? C.amber : C.green);
      doc.roundedRect(x + 2, y + 2, 16, 5.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(i === 0 ? "BEFORE" : "AFTER", x + 10, y + 5.8, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      color(C.muted);
      doc.text(t(`${formatShortDate(a.capturedAt)}  |  ${a.cloudinaryPublicId}`), x, y + h + 4.5);
    });
    y += h + 10;

    heading("AI Observed Changes");
    para("AI-observed visual changes between matched viewpoints. These are visual observations, not measurements.", 8.5, C.muted, 4.4);
    y += 1;
    cmp.observations.forEach((o) => {
      ensure(7);
      fill(C.green);
      doc.circle(M + 1.8, y - 1.3, 1.8, "F");
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.45);
      doc.line(M + 1, y - 1.3, M + 1.6, y - 0.6);
      doc.line(M + 1.6, y - 0.6, M + 2.7, y - 2.1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(C.ink);
      doc.text(t(o), M + 6, y);
      y += 6.5;
    });
    doc.setFontSize(8.5);
    color(C.muted);
    doc.text(`AI confidence ${cmp.confidence}%`, M, y);
    y += 4;
  }

  heading("AI Summary");
  doc.setFontSize(10);
  const sumLines = doc.splitTextToSize(t(report.summary), CW - 10) as string[];
  const boxH = sumLines.length * 5 + 8;
  ensure(boxH);
  fill(C.tint);
  doc.rect(M, y - 4, CW, boxH, "F");
  fill(C.green);
  doc.rect(M, y - 4, 1.2, boxH, "F");
  doc.setFont("helvetica", "normal");
  color(C.ink);
  sumLines.forEach((l, i) => doc.text(l, M + 5, y + 1.5 + i * 5));
  y += boxH + 2;

  if (report.evidence.length) {
    const w = (CW - 6) / 2;
    const h = w * 0.625;
    heading("Visual Evidence", h + 40);
    for (let i = 0; i < report.evidence.length; i += 2) {
      const pair = report.evidence.slice(i, i + 2);
      doc.setFontSize(8.5);
      const capH = Math.max(...pair.map((e) => (doc.splitTextToSize(t(e.caption), w) as string[]).length)) * 4 + 10;
      ensure(h + capH + 2);
      pair.forEach((e, j) => {
        const a = byId.get(e.assetId);
        if (!a) return;
        const x = M + j * (w + 6);
        drawImage(a.id, x, y, w, h);
        let cy = y + h + 4.5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        const pc = PHASE_RGB[a.phase];
        color(pc);
        doc.text(`${PHASE_LABEL[a.phase]}  |  ${formatShortDate(a.capturedAt)}  |  ${a.confidence}% confidence`, x, cy);
        cy += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        color(C.body);
        (doc.splitTextToSize(t(e.caption), w) as string[]).forEach((l) => {
          doc.text(l, x, cy);
          cy += 4;
        });
        doc.setFontSize(7);
        color(C.muted);
        doc.text(t(a.cloudinaryPublicId), x, cy);
      });
      y += h + capH + 2;
    }
  }

  heading("Source Assets & Evidence Metadata", 50);
  para("Every insight in this report is traceable to the original media assets listed below.", 8.5, C.muted, 4.4);
  y += 2;
  const cols = [
    { h: "Source asset (Cloudinary public ID)", w: 66 },
    { h: "Filename", w: 32 },
    { h: "Captured", w: 22 },
    { h: "Phase", w: 15 },
    { h: "Site", w: 27 },
    { h: "Conf.", w: 12 },
  ];
  const header = () => {
    ensure(9);
    fill(C.deep);
    doc.rect(M, y - 4.4, CW, 6.4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(230, 236, 233);
    let x = M + 2;
    cols.forEach((c) => {
      doc.text(c.h, x, y);
      x += c.w;
    });
    y += 6;
  };
  header();
  report.sourceAssetIds.forEach((id, i) => {
    const a = byId.get(id);
    if (!a) return;
    if (y + 6 > BOTTOM) {
      newPage();
      header();
    }
    if (i % 2 === 1) {
      fill(C.tint);
      doc.rect(M, y - 4, CW, 5.8, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    color(C.ink);
    const row = [a.cloudinaryPublicId, a.filename, formatShortDate(a.capturedAt), PHASE_LABEL[a.phase], a.site ?? "-", `${a.confidence}%`];
    let x = M + 2;
    row.forEach((v, k) => {
      const maxW = cols[k].w - 2;
      let s = t(v);
      while (doc.getTextWidth(s) > maxW && s.length > 4) s = s.slice(0, -2);
      if (s !== t(v)) s = `${s.slice(0, -1)}...`;
      doc.text(s, x, y);
      x += cols[k].w;
    });
    y += 5.8;
  });

  heading("Methodology");
  para(report.methodology, 8.5, C.muted, 4.4);

  // ── Footer on every page ─────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    stroke(C.line);
    doc.setLineWidth(0.3);
    doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    color(C.muted);
    doc.text("Generated by ImpactLens", M, PAGE_H - 9);
    doc.text(t(project.name), PAGE_W / 2, PAGE_H - 9, { align: "center" });
    doc.text(`Page ${p} of ${pages}`, PAGE_W - M, PAGE_H - 9, { align: "right" });
  }

  return doc.output("arraybuffer");
}
