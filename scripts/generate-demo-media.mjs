/**
 * Generates the demo workspace media set in /public/demo.
 *
 * Scenes are rendered procedurally from a seed so that before/after pairs
 * share an identical viewpoint (same horizon, shoreline and tree line) and
 * only the field conditions change. This keeps the comparison slider honest.
 *
 * Usage: npm run generate:demo-media  (requires `sharp`; ffmpeg optional for video)
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "demo");
mkdirSync(OUT, { recursive: true });

const W = 1280;
const H = 800;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

const SKIES = {
  morning: ["#9fb8c9", "#d9d3c2", "#f2dcb4"],
  noon: ["#7fa6c4", "#b9cfdd", "#e3e8e6"],
  hazy: ["#a9b3b3", "#c9c7ba", "#ddd3bd"],
  evening: ["#6d7fa0", "#c79a86", "#efc08e"],
};

function defs(time) {
  const [a, b, c] = SKIES[time];
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <linearGradient id="waterDirty" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7d8a78"/><stop offset="1" stop-color="#4f5a45"/>
    </linearGradient>
    <linearGradient id="waterClean" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fb0bb"/><stop offset="1" stop-color="#3f6f78"/>
    </linearGradient>
    <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9a8567"/><stop offset="1" stop-color="#6b5a43"/>
    </linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b9ab94"/><stop offset="1" stop-color="#8d8070"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.38"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.09"/></feComponentTransfer>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>
    <filter id="far"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>`;
}

/** Layout is derived from the seed only, so paired scenes share geometry. */
function layout(seed, variant) {
  const r = rng(seed);
  const horizon = variant === "wide" ? 300 : 330 + r() * 40;
  const hills = [];
  let x = -40;
  while (x < W + 80) {
    hills.push([x, horizon - 20 - r() * 45]);
    x += 60 + r() * 90;
  }
  const trees = [];
  for (let i = 0; i < 150; i++) trees.push([r() * W, horizon - 4 - r() * 26, 10 + r() * 18]);
  const skyline = [];
  for (let i = 0; i < 16; i++) skyline.push([W * 0.55 + r() * W * 0.35, 10 + r() * 34, 14 + r() * 24]);
  // shoreline: a gentle diagonal across the lower frame
  const s0 = variant === "ghat" ? 560 : 520 + r() * 40;
  const s1 = variant === "ghat" ? 560 : 610 + r() * 60;
  const shorePts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    shorePts.push([t * W, s0 + (s1 - s0) * t + Math.sin(t * 9 + seed) * 10]);
  }
  const ripples = [];
  for (let i = 0; i < 70; i++) ripples.push([r() * W, horizon + 8 + r() * (s0 - horizon - 10), 20 + r() * 80]);
  return { horizon, hills, trees, skyline, shorePts, ripples, s0, s1 };
}

const shoreY = (L, x) => {
  const i = Math.min(19, Math.max(0, Math.floor((x / W) * 20)));
  const [x0, y0] = L.shorePts[i];
  const [x1, y1] = L.shorePts[i + 1];
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
};

function wasteItem(r, x, y, scale = 1) {
  const kind = pick(r, ["bottle", "bottle", "bag", "bag", "wrap", "foam"]);
  const rot = Math.floor(r() * 180);
  const s = scale * (0.7 + r() * 0.6);
  if (kind === "bottle") {
    const c = pick(r, ["#d6e6ef", "#9cc3d6", "#6fa577", "#e9edf0"]);
    return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" opacity="0.92"><rect x="-11" y="-4" width="22" height="8" rx="3" fill="${c}"/><rect x="11" y="-2" width="5" height="4" fill="#2f6fae"/></g>`;
  }
  if (kind === "bag") {
    const c = pick(r, ["#efefea", "#e4b8c4", "#2c2c2c", "#c9d9e8", "#f1e3a8"]);
    return `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s})" d="M-14 2 C-12 -10 -2 -9 2 -6 C8 -12 16 -4 13 4 C10 11 -9 11 -14 2Z" fill="${c}" opacity="0.9"/>`;
  }
  if (kind === "wrap") {
    const c = pick(r, ["#d9463b", "#f0b429", "#3a7bd5", "#8e44ad", "#e67e22"]);
    return `<rect transform="translate(${x},${y}) rotate(${rot}) scale(${s})" x="-7" y="-4" width="14" height="8" rx="1" fill="${c}" opacity="0.85"/>`;
  }
  return `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${4 * s}" fill="#f4f1e6" opacity="0.55" filter="url(#soft)"/>`;
}

function worker(r, x, y, scale, pose = "bend") {
  const vest = pick(r, ["#f97316", "#facc15", "#84cc16"]);
  const skin = pick(r, ["#8d5a3b", "#6e4429", "#a36b47"]);
  const pants = pick(r, ["#2b3440", "#3b3226", "#1f2937"]);
  const bend = pose === "bend" ? 28 : 4;
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="0" cy="2" rx="22" ry="5" fill="#000" opacity="0.18"/>
    <rect x="-9" y="-44" width="7" height="44" rx="3" fill="${pants}"/>
    <rect x="2" y="-44" width="7" height="44" rx="3" fill="${pants}"/>
    <g transform="rotate(${bend} 0 -44)">
      <rect x="-12" y="-86" width="24" height="46" rx="8" fill="${vest}"/>
      <rect x="-12" y="-70" width="24" height="4" fill="#e5e7eb" opacity="0.85"/>
      <circle cx="0" cy="-96" r="10" fill="${skin}"/>
      <path d="M-10 -100 Q0 -112 10 -100Z" fill="${pick(r, ["#f5f5f4", "#1d4ed8", "#b91c1c"])}"/>
      <line x1="8" y1="-78" x2="${36 + bend}" y2="-30" stroke="${skin}" stroke-width="6" stroke-linecap="round"/>
    </g>
    ${pose === "bend" ? `<line x1="30" y1="-40" x2="70" y2="4" stroke="#7c5a3a" stroke-width="4"/><path d="M60 0 L82 0 L78 8 L64 8Z" fill="#4b5563"/>` : `<line x1="20" y1="-70" x2="24" y2="0" stroke="#7c5a3a" stroke-width="4"/>`}
  </g>`;
}

function sack(r, x, y, s) {
  const c = pick(r, ["#e8ecef", "#cfd8dc", "#3b82f6", "#f1f5f9"]);
  return `<path transform="translate(${x},${y}) scale(${s})" d="M-26 0 C-30 -30 -18 -44 -4 -46 L4 -54 L10 -46 C24 -42 30 -26 26 0Z" fill="${c}" stroke="#94a3b8" stroke-width="1.2"/>`;
}

function sapling(r, x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-12" y="-48" width="3" height="48" fill="#8b6b43"/><rect x="9" y="-48" width="3" height="48" fill="#8b6b43"/>
    <rect x="-12" y="-40" width="24" height="3" fill="#8b6b43"/><rect x="-12" y="-18" width="24" height="3" fill="#8b6b43"/>
    <line x1="0" y1="0" x2="0" y2="-52" stroke="#5b4a2e" stroke-width="2"/>
    <ellipse cx="-7" cy="-50" rx="8" ry="4" fill="#4d9a45" transform="rotate(-25 -7 -50)"/>
    <ellipse cx="7" cy="-56" rx="8" ry="4" fill="#5fb351" transform="rotate(25 7 -56)"/>
    <ellipse cx="0" cy="-62" rx="6" ry="3.5" fill="#4d9a45"/>
  </g>`;
}

function grass(r, x, y, s, lush) {
  const c = lush ? pick(r, ["#4f8f3a", "#5fa044", "#3f7a31"]) : pick(r, ["#8a8a52", "#9a8f5a", "#6f7a45"]);
  let p = "";
  for (let i = 0; i < 7; i++) {
    const dx = (r() - 0.5) * 22 * s;
    p += `<path d="M${x + dx} ${y} q${(r() - 0.5) * 10} ${-18 * s} ${(r() - 0.5) * 12} ${-(20 + r() * 20) * s}" stroke="${c}" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round"/>`;
  }
  return p;
}

/**
 * @param {object} o
 * seed, variant ('shore'|'wide'|'ghat'|'drain'), time, waste 0..1,
 * workers, sacks, saplings, lush 0..1, clean boolean, boat
 */
function lakeScene(o) {
  const L = layout(o.seed, o.variant);
  const r = rng(o.seed * 31 + (o.salt ?? 0));
  const waterFill = o.clean ? "url(#waterClean)" : "url(#waterDirty)";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(o.time)}`;
  s += `<rect width="${W}" height="${L.horizon + 2}" fill="url(#sky)"/>`;
  s += `<circle cx="${o.time === "evening" ? 980 : 260}" cy="${L.horizon - 150}" r="46" fill="#fff6dc" opacity="0.55" filter="url(#far)"/>`;
  // distant skyline (Bhopal old city edge)
  s += `<g filter="url(#far)" opacity="0.5">${L.skyline.map(([x, h, w]) => `<rect x="${x}" y="${L.horizon - 30 - h}" width="${w}" height="${h + 30}" fill="#8c95a0"/>`).join("")}</g>`;
  s += `<path d="M-40 ${L.horizon} ${L.hills.map(([x, y]) => `L${x} ${y}`).join(" ")} L${W + 80} ${L.horizon}Z" fill="#8fa29a" opacity="0.8" filter="url(#far)"/>`;
  s += L.trees.map(([x, y, rad]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${o.lush > 0.5 ? "#35583a" : "#4a5a3e"}" opacity="0.92"/>`).join("");
  // water
  s += `<rect y="${L.horizon}" width="${W}" height="${H - L.horizon}" fill="${waterFill}"/>`;
  s += `<rect y="${L.horizon}" width="${W}" height="14" fill="#dfe7e4" opacity="${o.clean ? 0.35 : 0.2}"/>`;
  s += L.ripples.map(([x, y, w]) => `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#eef4f2" stroke-width="1.4" opacity="${o.clean ? 0.45 : 0.22}"/>`).join("");
  if (!o.clean && o.algae) {
    for (let i = 0; i < 26; i++) {
      const x = r() * W;
      const y = L.horizon + 40 + r() * (L.s0 - L.horizon - 40);
      s += `<ellipse cx="${x}" cy="${y}" rx="${30 + r() * 60}" ry="${4 + r() * 6}" fill="#6f7f3c" opacity="0.45" filter="url(#soft)"/>`;
    }
  }
  if (o.boat) {
    const bx = 760 + r() * 200;
    const by = L.horizon + 70;
    s += `<g transform="translate(${bx},${by})"><path d="M-60 0 L60 0 L44 16 L-44 16Z" fill="#6b4a2f"/><rect x="-44" y="-2" width="88" height="4" fill="#8b6a45"/>${o.boatWorker ? worker(r, 0, 0, 0.55, "stand") : ""}</g>`;
  }
  // floating waste near the waterline
  const floatN = Math.round(o.waste * 55);
  for (let i = 0; i < floatN; i++) {
    const x = r() * W;
    const sy = shoreY(L, x);
    const y = sy - 6 - Math.pow(r(), 2) * 120;
    s += wasteItem(r, x, y, 0.8 + (y / H) * 0.6);
  }
  // shore / ghat
  const shorePath = `M0 ${H} L0 ${L.shorePts[0][1]} ${L.shorePts.map(([x, y]) => `L${x} ${y}`).join(" ")} L${W} ${H}Z`;
  if (o.variant === "ghat") {
    s += `<path d="${shorePath}" fill="url(#stone)"/>`;
    for (let k = 0; k < 6; k++) {
      const y = L.s0 + 8 + k * 40;
      s += `<rect x="0" y="${y}" width="${W}" height="6" fill="#6f655a" opacity="0.5"/>`;
    }
    s += `<rect x="1040" y="${L.s0 - 150}" width="120" height="150" fill="#c8b89c"/><path d="M1030 ${L.s0 - 150} L1100 ${L.s0 - 200} L1170 ${L.s0 - 150}Z" fill="#b0503a"/>`;
  } else {
    s += `<path d="${shorePath}" fill="url(#earth)"/>`;
    s += `<path d="M0 ${L.shorePts[0][1]} ${L.shorePts.map(([x, y]) => `L${x} ${y}`).join(" ")}" stroke="#d8d2c0" stroke-width="5" fill="none" opacity="${o.clean ? 0.6 : 0.3}"/>`;
    for (let i = 0; i < 90; i++) {
      const x = r() * W;
      const y = shoreY(L, x) + 10 + r() * (H - shoreY(L, x));
      s += `<ellipse cx="${x}" cy="${y}" rx="${2 + r() * 5}" ry="${1 + r() * 3}" fill="#5a4a36" opacity="0.5"/>`;
    }
  }
  if (o.variant === "drain") {
    s += `<rect x="120" y="${shoreY(L, 120) - 10}" width="170" height="${H}" fill="#6f6860"/><rect x="150" y="${shoreY(L, 150)}" width="110" height="${H}" fill="#4a473f"/>`;
  }
  // vegetation along the shore
  const grassN = o.variant === "ghat" ? 6 : 30 + Math.round(o.lush * 120);
  for (let i = 0; i < grassN; i++) {
    const x = r() * W;
    const y = shoreY(L, x) + 6 + r() * (H - shoreY(L, x) - 6);
    s += grass(r, x, y, 0.8 + (y / H) * 0.9, o.lush > 0.45);
  }
  // waste on the shore
  const shoreN = Math.round(o.waste * 85);
  for (let i = 0; i < shoreN; i++) {
    const x = r() * W;
    const y = shoreY(L, x) + 4 + Math.pow(r(), 2.4) * (H - shoreY(L, x));
    s += wasteItem(r, x, y, 0.9 + (y / H) * 1.1);
  }
  for (let i = 0; i < (o.saplings ?? 0); i++) {
    const x = 120 + (i / Math.max(1, o.saplings - 1)) * (W - 240) + (r() - 0.5) * 40;
    const y = shoreY(L, x) + 60 + r() * 60;
    s += sapling(r, x, y, 0.9 + (y / H) * 0.6);
  }
  if (o.sacks) {
    const cx = o.sackX ?? 950;
    for (let i = 0; i < o.sacks; i++) {
      s += sack(r, cx + (r() - 0.5) * 170, shoreY(L, cx) + 110 + r() * 60 - (i % 3) * 10, 1 + r() * 0.5);
    }
  }
  for (let i = 0; i < (o.workers ?? 0); i++) {
    const x = 180 + ((i + 0.5) / o.workers) * (W - 400) + (r() - 0.5) * 60;
    const y = shoreY(L, x) + 70 + r() * 90;
    s += worker(r, x, y, 0.9 + (y / H) * 0.7, i % 3 === 2 ? "stand" : "bend");
  }
  s += `<rect width="${W}" height="${H}" fill="url(#vignette)"/><rect width="${W}" height="${H}" filter="url(#grain)"/></svg>`;
  return s;
}

function villageScene(o) {
  const r = rng(o.seed);
  const horizon = 360;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(o.time)}`;
  s += `<rect width="${W}" height="${horizon + 2}" fill="url(#sky)"/>`;
  s += `<path d="M0 ${horizon} Q320 ${horizon - 60} 640 ${horizon - 20} T1280 ${horizon - 30} L1280 ${horizon} Z" fill="#8f9e86" opacity="0.8" filter="url(#far)"/>`;
  s += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="${o.dry ? "#b59a6d" : "#9c8c64"}"/>`;
  for (let i = 0; i < 120; i++) s += `<ellipse cx="${r() * W}" cy="${horizon + r() * (H - horizon)}" rx="${3 + r() * 7}" ry="${1 + r() * 3}" fill="#7d6a48" opacity="0.4"/>`;
  for (let i = 0; i < 40; i++) {
    const x = r() * W;
    s += `<circle cx="${x}" cy="${horizon - 10 - r() * 20}" r="${14 + r() * 20}" fill="#4f6a3f" opacity="0.9"/>`;
  }
  // houses
  const houses = o.houses ?? 3;
  for (let i = 0; i < houses; i++) {
    const hx = 80 + i * 390 + r() * 40;
    const hy = horizon + 40;
    s += `<rect x="${hx}" y="${hy}" width="300" height="190" fill="${pick(r, ["#d9c7a4", "#cdb68f", "#e2d3b5"])}"/>`;
    s += `<rect x="${hx + 120}" y="${hy + 90}" width="60" height="100" fill="#5b4632"/><rect x="${hx + 30}" y="${hy + 60}" width="50" height="40" fill="#44525c"/>`;
    s += `<path d="M${hx - 20} ${hy} L${hx + 150} ${hy - 90} L${hx + 320} ${hy}Z" fill="${o.panels > i ? "#8c6b52" : "#9b5a3c"}"/>`;
    if (o.panels > i) {
      for (let p = 0; p < 4; p++) {
        const px = hx + 30 + p * 60;
        s += `<g transform="translate(${px},${hy - 30}) skewX(-20)"><rect width="52" height="30" fill="#1e3a5f" stroke="#cbd5e1" stroke-width="1.5"/><line x1="17" y1="0" x2="17" y2="30" stroke="#94a3b8"/><line x1="34" y1="0" x2="34" y2="30" stroke="#94a3b8"/><line x1="0" y1="15" x2="52" y2="15" stroke="#94a3b8"/></g>`;
      }
    }
    if (o.install && i === 1) {
      s += `<line x1="${hx - 30}" y1="${hy + 190}" x2="${hx + 20}" y2="${hy - 20}" stroke="#a16207" stroke-width="6"/>`;
      s += worker(r, hx + 80, hy - 20, 0.9, "stand");
      s += worker(r, hx + 210, hy - 30, 0.9, "bend");
    }
  }
  if (o.tap) {
    const tx = 900;
    const ty = 700;
    s += `<rect x="${tx - 60}" y="${ty - 20}" width="200" height="30" fill="#9ca3af"/><rect x="${tx}" y="${ty - 130}" width="18" height="110" fill="#1e40af"/><rect x="${tx}" y="${ty - 130}" width="60" height="14" fill="#1e40af"/><path d="M${tx + 56} ${ty - 116} q4 40 0 80" stroke="#bfe3f2" stroke-width="7" fill="none" opacity="0.85"/>`;
    s += `<ellipse cx="${tx + 58}" cy="${ty - 12}" rx="26" ry="10" fill="#b8a07a"/><path d="M${tx + 36} ${ty - 40} h44 l-6 30 h-32z" fill="#c2410c"/>`;
    s += worker(r, tx - 120, ty, 1.1, "stand");
  }
  if (o.trench) {
    s += `<path d="M0 640 Q640 600 1280 660 L1280 690 Q640 630 0 670Z" fill="#5c4a33"/><rect x="0" y="648" width="1280" height="8" fill="#1d4ed8" opacity="0.8" transform="rotate(1 640 650)"/>`;
    for (let i = 0; i < 3; i++) s += worker(r, 300 + i * 300, 720, 1.2, "bend");
  }
  if (o.dry) {
    s += `<rect x="880" y="580" width="16" height="120" fill="#6b7280"/><rect x="870" y="560" width="70" height="24" fill="#6b7280"/><rect x="930" y="570" width="60" height="6" fill="#6b7280"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${820 + i * 28} 720 h22 l-4 -34 h-14z" fill="${pick(r, ["#c2410c", "#a16207", "#1d4ed8"])}"/>`;
  }
  s += `<rect width="${W}" height="${H}" fill="url(#vignette)"/><rect width="${W}" height="${H}" filter="url(#grain)"/></svg>`;
  return s;
}

const scenes = [
  // Bhopal Lake Restoration — Before
  ["lake-before-01", lakeScene({ seed: 11, variant: "shore", time: "morning", waste: 0.95, lush: 0.2, algae: true })],
  ["lake-before-02", lakeScene({ seed: 23, variant: "ghat", time: "hazy", waste: 0.8, lush: 0.1 })],
  ["lake-before-03", lakeScene({ seed: 37, variant: "wide", time: "noon", waste: 0.6, lush: 0.25, algae: true })],
  ["lake-before-04", lakeScene({ seed: 41, variant: "drain", time: "hazy", waste: 1, lush: 0.15, algae: true })],
  // During
  ["lake-during-01", lakeScene({ seed: 11, salt: 5, variant: "shore", time: "morning", waste: 0.55, lush: 0.2, workers: 4, sacks: 3 })],
  ["lake-during-02", lakeScene({ seed: 53, variant: "shore", time: "noon", waste: 0.3, lush: 0.3, workers: 2, sacks: 14, sackX: 700 })],
  ["lake-during-03", lakeScene({ seed: 37, salt: 9, variant: "wide", time: "morning", waste: 0.35, lush: 0.3, workers: 5, boat: true, boatWorker: true })],
  ["lake-during-04", lakeScene({ seed: 61, variant: "shore", time: "evening", waste: 0.08, lush: 0.45, workers: 3, saplings: 6 })],
  ["lake-during-05", lakeScene({ seed: 41, salt: 3, variant: "drain", time: "noon", waste: 0.35, lush: 0.3, workers: 3, sacks: 4, sackX: 700 })],
  // After
  ["lake-after-01", lakeScene({ seed: 11, salt: 8, variant: "shore", time: "morning", waste: 0.03, lush: 0.85, clean: true })],
  ["lake-after-02", lakeScene({ seed: 61, salt: 4, variant: "shore", time: "noon", waste: 0.0, lush: 1, clean: true, saplings: 6 })],
  ["lake-after-03", lakeScene({ seed: 37, salt: 2, variant: "wide", time: "noon", waste: 0.02, lush: 0.8, clean: true, boat: true })],
  ["lake-after-04", lakeScene({ seed: 23, salt: 7, variant: "ghat", time: "evening", waste: 0.02, lush: 0.4, clean: true })],
  // Community Solar Installation
  ["solar-before-01", villageScene({ seed: 71, time: "noon", panels: 0 })],
  ["solar-during-01", villageScene({ seed: 71, time: "morning", panels: 1, install: true })],
  ["solar-after-01", villageScene({ seed: 71, time: "evening", panels: 3 })],
  // Village Water Access
  ["water-before-01", villageScene({ seed: 83, time: "hazy", panels: 0, houses: 2, dry: true })],
  ["water-during-01", villageScene({ seed: 83, time: "noon", panels: 0, houses: 2, trench: true })],
  ["water-after-01", villageScene({ seed: 83, time: "morning", panels: 0, houses: 2, tap: true })],
];

for (const [name, svg] of scenes) {
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));
  process.stdout.write(`✓ ${name}.jpg\n`);
}

// Video asset: a short pan across the cleanup drive (lake-during-03)
try {
  const src = path.join(OUT, "lake-during-03.jpg");
  const dst = path.join(OUT, "lake-during-03.mp4");
  if (existsSync(dst)) unlinkSync(dst);
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-loop", "1", "-i", src,
    "-vf", "scale=1600:-1,zoompan=z='1.0+0.0009*on':x='iw/2-(iw/zoom/2)+on*0.6':y='ih/2-(ih/zoom/2)':d=150:s=960x600:fps=25",
    "-t", "6", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "30", "-movflags", "+faststart", dst,
  ]);
  process.stdout.write("✓ lake-during-03.mp4\n");
} catch {
  process.stdout.write("! ffmpeg not available, skipped video\n");
}

writeFileSync(path.join(OUT, "README.txt"), "Demo workspace media. Regenerate with `npm run generate:demo-media`.\n");
