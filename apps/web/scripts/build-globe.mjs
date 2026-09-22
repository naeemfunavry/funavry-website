/**
 * Generates the Earth geometry for the Capabilities globe.
 *
 * The globe shows a recognisable Earth — that is not something to draw from
 * memory: a wrong-looking Earth is worse than an honest abstract sphere, because
 * everyone knows what this shape is supposed to be. So the continents come from
 * real geography — Natural Earth's 110m land layer via world-atlas, which is
 * public domain — and this script bakes them into a static module.
 *
 * It runs offline, at author time, and its output is committed. Nothing here
 * ships: the site gets plain arrays of numbers, no topojson, no d3. Re-run only
 * to change the dot density or the island filter:
 *
 *   node scripts/build-globe.mjs
 *
 * WHAT THIS EMITS — and why it is not projected.
 *
 * The globe turns to face an office when you hover it, so there is no longer one
 * camera to bake in. This emits raw lon/lat and the component projects at
 * runtime (4.4k vertices ≈ 4 Mflop/s at 60fps — nothing, and it only runs during
 * the ~700ms turn). Two consequences of dropping the fixed camera:
 *
 *   - Nothing can be culled here any more. Every point may rotate into view, so
 *     the far hemisphere has to ship too. That roughly doubles the data, which
 *     is why the island filter below exists.
 *   - The graticule is gone entirely. It is a regular lat/lon grid — pure
 *     arithmetic — so the component generates it in a loop. Storing ~1,400
 *     points to describe "every 20 degrees" was always silly; a fixed camera
 *     just hid that by pre-clipping it.
 *
 * Limb clipping also moves to the component, for the same reason.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const OUT = "src/lib/globe-geometry.ts";

/** Degrees between dot rows. ~3° matches the reference render's dot pitch. */
const LAT_STEP = 2.8;
/**
 * Split coastline segments longer than this. A 110m coastline has edges tens of
 * degrees long, which project to visibly straight lines across a curved sphere.
 */
const DENSIFY = 4;
/**
 * Drop rings whose bounding box is smaller than this, in degrees. The sphere
 * renders ~280px across, so 1° ≈ 2.4px: below ~1.2° a ring is a sub-pixel speck
 * that costs bytes and draws nothing. Natural Earth 110m is mostly continents,
 * but it carries enough small islands to matter now that the far side ships too.
 */
const MIN_SPAN = 1.2;
/**
 * Coordinates are written to 1dp, tuned against the size this actually renders:
 * at sphere r=138 units, 0.1° = 0.24px. A second decimal buys 0.02px.
 */
const fmt = (n) => +n.toFixed(1);

const rad = (d) => (d * Math.PI) / 180;

console.log("fetching", SRC);
const topo = await fetch(SRC).then((r) => {
  if (!r.ok) throw new Error(`land-110m fetch failed: HTTP ${r.status}`);
  return r.json();
});

// ---- decode topojson: quantised, delta-encoded arcs ----
const {
  scale: [sx, sy],
  translate: [tx, ty],
} = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
});
const arcOf = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
const ringOf = (idx) => {
  const pts = [];
  for (const i of idx) {
    const a = arcOf(i);
    pts.push(...(pts.length ? a.slice(1) : a));
  }
  return pts;
};

const obj = topo.objects.land;
const geoms = obj.type === "GeometryCollection" ? obj.geometries : [obj];
const polys = [];
for (const g of geoms) {
  if (g.type === "MultiPolygon") for (const p of g.arcs) polys.push(p.map(ringOf));
  else if (g.type === "Polygon") polys.push(g.arcs.map(ringOf));
}
console.log(`  ${polys.length} land polygons`);

// ---- point-in-land, for the dot matrix ----
function inRing(x, y, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function isLand(lon, lat) {
  for (const p of polys) {
    if (!inRing(lon, lat, p[0])) continue;
    let hole = false;
    for (let k = 1; k < p.length; k++)
      if (inRing(lon, lat, p[k])) {
        hole = true;
        break;
      }
    if (!hole) return true;
  }
  return false;
}

/** Great-circle interpolation, so densified points stay on the sphere. */
function slerp(a, b, t) {
  const [lo1, la1] = a.map(rad);
  const [lo2, la2] = b.map(rad);
  const v1 = [
    Math.cos(la1) * Math.cos(lo1),
    Math.cos(la1) * Math.sin(lo1),
    Math.sin(la1),
  ];
  const v2 = [
    Math.cos(la2) * Math.cos(lo2),
    Math.cos(la2) * Math.sin(lo2),
    Math.sin(la2),
  ];
  let dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  dot = Math.max(-1, Math.min(1, dot));
  const om = Math.acos(dot);
  if (om < 1e-9) return a;
  const s1 = Math.sin((1 - t) * om) / Math.sin(om);
  const s2 = Math.sin(t * om) / Math.sin(om);
  const v = [
    s1 * v1[0] + s2 * v2[0],
    s1 * v1[1] + s2 * v2[1],
    s1 * v1[2] + s2 * v2[2],
  ];
  return [
    (Math.atan2(v[1], v[0]) * 180) / Math.PI,
    (Math.asin(Math.max(-1, Math.min(1, v[2]))) * 180) / Math.PI,
  ];
}

function densify(ring) {
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    let dlon = Math.abs(b[0] - a[0]);
    if (dlon > 180) dlon = 360 - dlon; // antimeridian
    const d = Math.hypot(dlon, b[1] - a[1]);
    const n = Math.floor(d / DENSIFY);
    for (let k = 1; k < n; k++) out.push(slerp(a, b, k / n));
  }
  return out;
}

/** Bounding span in degrees, used only by the island filter. */
function span(ring) {
  let lo = [180, 90];
  let hi = [-180, -90];
  for (const [x, y] of ring) {
    if (x < lo[0]) lo[0] = x;
    if (y < lo[1]) lo[1] = y;
    if (x > hi[0]) hi[0] = x;
    if (y > hi[1]) hi[1] = y;
  }
  return Math.max(hi[0] - lo[0], hi[1] - lo[1]);
}

// ---- coastline rings, as raw lon/lat ----
const rings = [];
let dropped = 0;
for (const poly of polys) {
  for (const ring of poly) {
    if (span(ring) < MIN_SPAN) {
      dropped++;
      continue;
    }
    const flat = [];
    let plon = null;
    let plat = null;
    for (const [lon, lat] of densify(ring)) {
      const a = fmt(lon);
      const b = fmt(lat);
      if (a === plon && b === plat) continue; // collapsed by rounding
      flat.push(a, b);
      plon = a;
      plat = b;
    }
    if (flat.length >= 6) rings.push(flat); // 3+ points, or it is not a ring
  }
}
console.log(`  ${rings.length} rings kept, ${dropped} sub-${MIN_SPAN}° specks dropped`);

// ---- dot matrix over land ----
const dots = [];
for (let lat = -84; lat <= 84; lat += LAT_STEP) {
  const circ = Math.cos(rad(lat));
  if (circ < 0.02) continue;
  const lonStep = LAT_STEP / circ; // even arc spacing, so the poles don't clot
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (!isLand(lon, lat)) continue;
    dots.push(fmt(lon), fmt(lat));
  }
}
console.log(`  ${dots.length / 2} land dots (whole sphere)`);

const ringPts = rings.reduce((a, r) => a + r.length / 2, 0);
console.log(`  ${ringPts} ring vertices, ${ringPts + dots.length / 2} total`);

const banner = `/**
 * GENERATED by scripts/build-globe.mjs — do not edit by hand.
 *
 * Real Earth geometry: Natural Earth 110m land, public domain.
 *
 * Raw lon/lat in degrees, NOT projected — the globe turns to face an office on
 * hover, so there is no single camera to bake in. \`src/components/ui/Globe.tsx\`
 * projects these orthographically at runtime and clips them against the limb.
 *
 * Both arrays are flat and paired: [lon, lat, lon, lat, ...]. Flat because these
 * are read once at module init into typed arrays of unit vectors, and an array
 * of 2-tuples costs an object header per point for nothing.
 */`;

const src = `${banner}

/** Coastline rings. Each is one closed ring, flattened: [lon, lat, lon, lat, ...]. */
export const LAND_RINGS: readonly (readonly number[])[] = [
${rings.map((r) => `  [${r.join(",")}],`).join("\n")}
];

/** Dots over land, flattened: [lon, lat, lon, lat, ...]. Whole sphere. */
export const LAND_DOTS: readonly number[] = [
  ${dots.join(",")},
];
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, src);
console.log(`\n  wrote ${OUT} (${(src.length / 1024).toFixed(1)} kB)`);
