/**
 * Runtime projection for the Capabilities globe.
 *
 * Pure geometry, no React — so `Globe.tsx` renders with it and
 * `scripts/check-globe.mjs` can test the exact code that ships (a hand-written
 * mirror is what let the earlier clip/transform bug through). The data in
 * `globe-geometry.ts` is raw lon/lat because the globe turns to face an office
 * on hover; there is no single camera to bake in, so it is projected here, each
 * frame, against whatever camera the turn is currently at.
 *
 * Everything is emitted in the geometry's own 200×200 box: sphere at (100,100),
 * r=100. `Globe.tsx` scales that box into the drawing.
 */
import { LAND_DOTS, LAND_RINGS } from "@/lib/globe-geometry";

export const RAD = Math.PI / 180;
/** Sphere radius in the 200×200 box. */
export const R = 100;
/** Cull dots this close to the limb; grazing specks read as noise, not surface. */
export const LIMB = 0.06;

export type Cam = { lon: number; lat: number };
export type CamK = { c0: number; s0: number; c1: number; s1: number };

export const camK = (c: Cam): CamK => ({
  c0: Math.cos(c.lon * RAD),
  s0: Math.sin(c.lon * RAD),
  c1: Math.cos(c.lat * RAD),
  s1: Math.sin(c.lat * RAD),
});

/** [lon,lat,…] → flat unit vectors [x,y,z,…]. Done once, at module load. */
export function toVecs(flat: readonly number[]): Float64Array {
  const n = flat.length / 2;
  const out = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const lon = flat[i * 2] * RAD;
    const lat = flat[i * 2 + 1] * RAD;
    const cl = Math.cos(lat);
    out[i * 3] = cl * Math.cos(lon);
    out[i * 3 + 1] = cl * Math.sin(lon);
    out[i * 3 + 2] = Math.sin(lat);
  }
  return out;
}

export const RINGS = LAND_RINGS.map(toVecs);
export const DOTS = toVecs(LAND_DOTS);

/** The graticule is a plain lat/lon grid — arithmetic, not data. Storing ~1,400
    points to say "every 20 degrees" would be silly, so it's built here. */
export const GRAT: Float64Array[] = (() => {
  const lines: number[][] = [];
  for (let lon = -180; lon < 180; lon += 20) {
    const l: number[] = [];
    for (let lat = -80; lat <= 80; lat += 4) l.push(lon, lat);
    lines.push(l);
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    const l: number[] = [];
    for (let lon = -180; lon <= 180; lon += 4) l.push(lon, lat);
    lines.push(l);
  }
  return lines.map(toVecs);
})();

/**
 * Rotate `v` into `buf` as unit vectors [X, Y, Z(depth), …].
 *
 *   Q = Rz(-lon0)·P                       spin the globe under the camera
 *   X = Qy,  Y = c1·Pz − s1·Qx,  Z = s1·Pz + c1·Qx      (Z > 0 faces us)
 *
 * Eight multiplies per point, no trig — the four camera terms come in via `k`,
 * computed once per frame, not per vertex.
 */
export function rotate(v: Float64Array, k: CamK, buf: Float64Array) {
  const n = v.length / 3;
  for (let i = 0; i < n; i++) {
    const px = v[i * 3];
    const py = v[i * 3 + 1];
    const pz = v[i * 3 + 2];
    const qx = px * k.c0 + py * k.s0;
    buf[i * 3] = -px * k.s0 + py * k.c0; // X
    buf[i * 3 + 1] = k.c1 * pz - k.s1 * qx; // Y
    buf[i * 3 + 2] = k.s1 * pz + k.c1 * qx; // Z (depth)
  }
}

const f = (n: number) => Math.round(n * 10) / 10;
const sxOf = (X: number) => 100 + R * X;
const syOf = (Y: number) => 100 - R * Y;

/**
 * Where the great circle between two rotated points crosses the limb (Z = 0).
 *
 * Closed form, exact, no trig: the chord point with Z=0 is at t = az/(az−bz),
 * and normalising it lands on the sphere — chord and arc share a plane through
 * the origin, so that IS the great-circle crossing.
 */
function limbCross(B: Float64Array, a: number, b: number): [number, number] {
  const az = B[a * 3 + 2];
  const bz = B[b * 3 + 2];
  const t = az / (az - bz);
  const x = B[a * 3] + (B[b * 3] - B[a * 3]) * t;
  const y = B[a * 3 + 1] + (B[b * 3 + 1] - B[a * 3 + 1]) * t;
  const m = Math.hypot(x, y) || 1;
  return [sxOf(x / m), syOf(y / m)];
}

let scratch = new Float64Array(0);
function buffer(n: number) {
  if (scratch.length < n * 3) scratch = new Float64Array(n * 3);
  return scratch;
}

/**
 * One coastline ring, cut against the limb.
 *
 * A ring that leaves the visible hemisphere and comes back is closed ALONG the
 * limb, not across it — close it with a chord and Asia gets sliced off with a
 * flat vertical edge where it should curve over the horizon.
 *
 * Direction comes from the ring's own tangent as it exits, not from "take the
 * shorter arc": a landmass can span more than half the limb, and the shortcut
 * then fills it inside-out. The large-arc flag is computed for the same reason.
 */
export function ringPath(v: Float64Array, k: CamK): string {
  const n = v.length / 3;
  const B = buffer(n);
  rotate(v, k, B);

  let anyVis = false;
  let start = -1;
  for (let i = 0; i < n; i++) {
    if (B[i * 3 + 2] > 0) anyVis = true;
    else if (start < 0) start = i;
  }
  if (!anyVis) return "";

  // Wholly visible: no cutting, just close it.
  if (start < 0) {
    let d = `M${f(sxOf(B[0]))} ${f(syOf(B[1]))}`;
    for (let i = 1; i < n; i++)
      d += `L${f(sxOf(B[i * 3]))} ${f(syOf(B[i * 3 + 1]))}`;
    return d + "Z";
  }

  // Walk from a hidden vertex, so runs open and close cleanly and the ring's
  // wrap-around never lands mid-run.
  const runs: number[][] = [];
  let cur: number[] | null = null;
  for (let s = 1; s <= n; s++) {
    const i = (start + s) % n;
    const j = (start + s - 1) % n;
    if (B[i * 3 + 2] > 0) {
      if (!cur) cur = limbCross(B, j, i).slice();
      cur.push(sxOf(B[i * 3]), syOf(B[i * 3 + 1]));
    } else if (cur) {
      const c = limbCross(B, j, i);
      cur.push(c[0], c[1]);
      runs.push(cur);
      cur = null;
    }
  }

  let d = "";
  for (const run of runs) {
    if (run.length < 6) continue;
    d += `M${f(run[0])} ${f(run[1])}`;
    for (let i = 2; i < run.length; i += 2) d += `L${f(run[i])} ${f(run[i + 1])}`;

    const ex = run[run.length - 2];
    const ey = run[run.length - 1];
    const px = run[run.length - 4];
    const py = run[run.length - 3];
    // Tangent of increasing θ at the exit, SVG space (y down): (−ry, rx). If the
    // ring is travelling that way, the closing arc keeps going that way.
    const rx = ex - 100;
    const ry = ey - 100;
    const sweep = (ex - px) * -ry + (ey - py) * rx > 0 ? 1 : 0;
    const th0 = Math.atan2(ry, rx);
    const th1 = Math.atan2(run[1] - 100, run[0] - 100);
    let dth = sweep ? th1 - th0 : th0 - th1;
    while (dth < 0) dth += 2 * Math.PI;
    d += `A${R} ${R} 0 ${dth > Math.PI ? 1 : 0} ${sweep} ${f(run[0])} ${f(run[1])}Z`;
  }
  return d;
}

/** An open polyline, cut at the limb — for the graticule, which isn't filled. */
export function linePath(v: Float64Array, k: CamK): string {
  const n = v.length / 3;
  const B = buffer(n);
  rotate(v, k, B);
  let d = "";
  let open = false;
  for (let i = 0; i < n; i++) {
    if (B[i * 3 + 2] > 0) {
      d += `${open ? "L" : "M"}${f(sxOf(B[i * 3]))} ${f(syOf(B[i * 3 + 1]))}`;
      open = true;
    } else open = false;
  }
  return d;
}

/** Depth bands the dots are bucketed into, brightest (nearest) last. */
export const BANDS = [0.15, 0.4, 0.68, 1.01];
export const BAND_OPACITY = BANDS.map(
  (hi, i) => 0.2 + ((i === 0 ? 0 : BANDS[i - 1]) + hi) * 0.28,
);

/**
 * Land dots, banded by depth into four paths.
 *
 * ~1,500 dots as 1,500 elements is 1,500 DOM nodes for a background motif. They
 * are identical in shape, so each band is one path — a dot is two arcs. Four
 * nodes instead of fifteen hundred, same picture.
 */
export function dotPaths(k: CamK): string[] {
  const n = DOTS.length / 3;
  const B = buffer(n);
  rotate(DOTS, k, B);
  const out = ["", "", "", ""];
  for (let i = 0; i < n; i++) {
    const z = B[i * 3 + 2];
    if (z <= LIMB) continue;
    let band = 0;
    while (band < 3 && z > BANDS[band]) band++;
    // Dots shrink toward the limb — the same surface, seen edge-on.
    const r = f(0.52 + z * 0.36);
    const x = f(sxOf(B[i * 3]));
    const y = f(syOf(B[i * 3 + 1]));
    out[band] +=
      `M${f(x - r)} ${y}a${r} ${r} 0 1 0 ${f(r * 2)} 0a${r} ${r} 0 1 0 ${f(-r * 2)} 0`;
  }
  return out;
}

/** A single lon/lat, projected. Used for the office markers. */
export function project(lon: number, lat: number, k: CamK) {
  const cl = Math.cos(lat * RAD);
  const px = cl * Math.cos(lon * RAD);
  const py = cl * Math.sin(lon * RAD);
  const pz = Math.sin(lat * RAD);
  const qx = px * k.c0 + py * k.s0;
  const X = -px * k.s0 + py * k.c0;
  const Y = k.c1 * pz - k.s1 * qx;
  return { x: sxOf(X), y: syOf(Y), z: k.s1 * pz + k.c1 * qx };
}
