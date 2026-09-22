/**
 * Renders the globe at a set of cameras straight from the SHIPPING geometry
 * (`src/lib/globe-project.ts`), so a bug in the projection or the limb-clipping
 * shows up in a PNG rather than in a browser nobody has open. This is the exact
 * code `Globe.tsx` runs — not a mirror of it — imported via Node type-stripping.
 *
 *   node scripts/check-globe.mjs
 *
 * Writes one PNG per camera into the scratchpad and prints an office-visibility
 * table. Look at the PNGs: continents must fill the right way round, with no
 * flat chord across the limb and no missing landmasses, at every camera —
 * especially the intermediate ones along the westward USA turn, where an
 * inside-out fill from the sweep heuristic would surface.
 */
import { createRequire } from "node:module";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

// Let Node import the TS module (and resolve its "@/..." alias).
register(
  "data:text/javascript," +
    encodeURIComponent(`
  export async function resolve(spec, ctx, next) {
    if (spec.startsWith('@/')) spec = ${JSON.stringify(pathToFileURL("src/").href)} + spec.slice(2) + '.ts';
    return next(spec, ctx);
  }
`),
  import.meta.url,
);

const SP =
  "C:/Users/SHEKHA~1/AppData/Local/Temp/claude/D--Projects-Funavry-Website-funavry-website/dc21c771-7a80-4ec1-adc4-61cdba24ed8a/scratchpad";

const proj = await import(pathToFileURL("src/lib/globe-project.ts").href);
const { OFFICES } = await import(pathToFileURL("src/lib/offices.ts").href);
const { camK, RINGS, GRAT, ringPath, linePath, dotPaths, project, BAND_OPACITY } =
  proj;

const G = { cx: 232, cy: 168, r: 138 };
const VB = { w: 460, h: 420 };
const SCALE = G.r / 100;

function svgFor(cam) {
  const k = camK(cam);
  const T = `translate(${G.cx} ${G.cy}) scale(${SCALE}) translate(-100 -100)`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" width="${VB.w * 2}" height="${VB.h * 2}" fill="none">
  <rect width="${VB.w}" height="${VB.h}" fill="#ffffff"/>
  <circle cx="${G.cx}" cy="${G.cy}" r="${G.r}" fill="#e8f0f8"/>
  <g transform="${T}">`;
  for (const v of GRAT)
    s += `<path d="${linePath(v, k)}" stroke="#8FCAEB" stroke-width="${0.4 / SCALE}" stroke-opacity="0.5"/>`;
  for (const v of RINGS)
    s += `<path d="${ringPath(v, k)}" fill="#7FA6CC" fill-opacity="0.45" stroke="#5B87B5" stroke-width="${0.3 / SCALE}" stroke-opacity="0.4"/>`;
  const dp = dotPaths(k);
  dp.forEach((d, i) => (s += `<path d="${d}" fill="#2F5F8F" opacity="${BAND_OPACITY[i]}"/>`));
  s += `</g>
  <circle cx="${G.cx}" cy="${G.cy}" r="${G.r}" fill="none" stroke="#B9CDE0" stroke-width="0.8"/>`;
  // office markers
  for (const o of OFFICES) {
    const p = project(o.at.lon, o.at.lat, k);
    if (p.z <= 0.02) continue;
    const x = G.cx + (p.x - 100) * SCALE;
    const y = G.cy + (p.y - 100) * SCALE;
    s += `<circle cx="${x}" cy="${y}" r="${(2 + p.z * 2).toFixed(1)}" fill="#F59F13" stroke="#fff" stroke-width="1"/>`;
  }
  s += `</svg>`;
  return s;
}

const CAMS = [
  ["rest", { lon: 14, lat: 16 }],
  ["pakistan", { lon: 74.36, lat: 31.52 }],
  ["uae", { lon: 55.14, lat: 25.07 }],
  ["usa", { lon: -121.89, lat: 37.34 }],
  // intermediates along the westward USA turn (14 -> -121.89 the short way)
  ["usa-path-1", { lon: -20, lat: 24 }],
  ["usa-path-2", { lon: -60, lat: 30 }],
  ["usa-path-3", { lon: -100, lat: 35 }],
];

for (const [name, cam] of CAMS) {
  await sharp(Buffer.from(svgFor(cam))).png().toFile(`${SP}/gc-${name}.png`);
}

console.log("office visibility (z>0 = facing us, ~1 = dead centre):\n");
console.log("  camera        Pakistan   USA      UAE");
for (const [name, cam] of CAMS) {
  const k = camK(cam);
  const z = OFFICES.map((o) => project(o.at.lon, o.at.lat, k).z.toFixed(2).padStart(6));
  console.log(`  ${name.padEnd(12)} ${z.join("   ")}`);
}
console.log(`\nwrote ${CAMS.length} PNGs (gc-*.png) to scratchpad`);
