/**
 * Normalises the trusted-partner marks so a row of them reads as one set.
 *
 * The delivered files in /public/clients/webp are all 120x120, which looks
 * uniform and isn't: what varies is how much of that canvas each logo's *ink*
 * actually occupies. Measured across the set it runs from 21% (Deline Media, a
 * wide wordmark floating in whitespace) to 85% (HTMLPro, drawn edge to edge).
 * Every cell in the strip is pixel-identical, so those two render 4.1x apart —
 * and no CSS can correct it, because `object-contain` fits the canvas and the
 * canvas is not the logo. The whitespace is inside the file.
 *
 * So the fix has to be in the artwork:
 *
 *   1. trim each source to its own ink,
 *   2. rescale it to a constant ink AREA — not height, not width. The eye reads
 *      area, so a 4.8:1 wordmark and a square roundel only look like the same
 *      size when they cover the same amount of ground,
 *   3. centre it on one canvas, identical for every mark.
 *
 * After that the strip's CSS is one fixed box and nothing else.
 *
 * On sharpness: these 120px sources are all that exist — no SVG, no larger
 * originals anywhere in the repo — so this cannot invent detail. It picks the
 * largest target that keeps the worst upscale mild (~1.5x on the three widest
 * wordmarks; most marks land at 1x or are downscaled) and prints the factor for
 * every file so a bad one is visible rather than discovered on a retina screen.
 * Real sharpness at a larger size needs real vector art.
 *
 * Run after adding or replacing a client logo:
 *   node scripts/normalize-client-logos.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/clients/webp";
const OUT = "public/clients/optimized";

/** Output canvas, at 2x the CSS box the strip draws (100x56). */
const CANVAS_W = 200;
const CANVAS_H = 112;

/**
 * Target ink area on that canvas, in px². 7056 = an 84x84 square, so ~42px of
 * optical size once halved for the 2x box. Chosen against the real measurements:
 * larger and the thin wordmarks upscale past ~1.5x and go visibly soft; smaller
 * and the set stops carrying the strip.
 */
const TARGET_AREA = 7056;

/** A pixel is ink if it's neither transparent nor effectively the page. */
function inkBounds(data, W, H, C) {
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a <= 24) continue;
      if (r > 244 && g > 244 && b > 244) continue; // white plate, not the mark
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/** Same, but alpha only — for a mark that really is white on transparent. */
function alphaBounds(data, W, H, C) {
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * C + 3] <= 24) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/**
 * Clears a white plate. High-resolution logos often arrive as JPEGs or PNGs on
 * solid white, which shows as a white box on the strip's paper ground.
 *
 * Flood-fills from the border through light pixels only, so white that the
 * mark encloses — Del Monte's lettering on its red shield — is never reached
 * and stays opaque. Alpha ramps across the light band rather than cutting at
 * one value, so anti-aliased edges fade instead of leaving a jagged fringe.
 * Mutates `data` in place; a source whose border isn't light is left alone.
 */
const PLATE_MIN = 232;
function clearWhitePlate(data, W, H, C) {
  const light = (p) => {
    const i = p * C;
    return data[i + 3] > 24 && Math.min(data[i], data[i + 1], data[i + 2]) > PLATE_MIN;
  };

  let border = 0, lightBorder = 0;
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { border++; if (light(y * W + x)) lightBorder++; }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { border++; if (light(y * W + x)) lightBorder++; }
  if (lightBorder / border < 0.6) return false;

  const seen = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  let top = 0;
  const push = (p) => { if (!seen[p] && light(p)) { seen[p] = 1; stack[top++] = p; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }

  while (top > 0) {
    const p = stack[--top];
    const i = p * C;
    const lum = Math.min(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = Math.round(data[i + 3] * ((255 - lum) / (255 - PLATE_MIN)));
    const x = p % W;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (p >= W) push(p - W);
    if (p < W * (H - 1)) push(p + W);
  }
  return true;
}

fs.mkdirSync(OUT, { recursive: true });

// Sources may arrive as PNG or JPEG as well; every output is WebP, named after
// its source.
const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
const report = [];

for (const sourceFile of files) {
  const src = path.join(SRC, sourceFile);
  const file = sourceFile.replace(/\.(png|jpe?g)$/i, ".webp");
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const cleared = clearWhitePlate(data, W, H, C);

  const b = inkBounds(data, W, H, C) ?? alphaBounds(data, W, H, C);
  if (!b) {
    console.warn(`  !! ${file}: no ink found, copied as-is`);
    await sharp(src).resize(CANVAS_W, CANVAS_H, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92 }).toFile(path.join(OUT, file));
    continue;
  }

  const inkW = b.maxX - b.minX + 1;
  const inkH = b.maxY - b.minY + 1;
  const ratio = inkW / inkH;

  // Constant area: h = sqrt(A / r), w = sqrt(A * r).
  let outH = Math.sqrt(TARGET_AREA / ratio);
  let outW = outH * ratio;

  // Never let a mark touch the canvas edge — a hair of air on every side, so
  // nothing looks cropped when the strip scrolls past.
  const maxW = CANVAS_W - 8;
  const maxH = CANVAS_H - 8;
  if (outW > maxW) { outW = maxW; outH = outW / ratio; }
  if (outH > maxH) { outH = maxH; outW = outH * ratio; }

  outW = Math.max(1, Math.round(outW));
  outH = Math.max(1, Math.round(outH));

  const scale = outW / inkW;

  // From the decoded (and possibly plate-cleared) pixels, not the file again.
  const trimmed = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .extract({ left: b.minX, top: b.minY, width: inkW, height: inkH })
    .resize(outW, outH, { fit: "fill", kernel: "lanczos3" })
    // Raw in means raw out; the composite below needs an encoded image.
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: trimmed, gravity: "centre" }])
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, file));

  report.push({ file: cleared ? `${file} (plate)` : file, ink: `${inkW}x${inkH}`, out: `${outW}x${outH}`, scale });
}

report.sort((a, b) => b.scale - a.scale);
console.log("\n  file                   ink       -> normalised   scale");
for (const r of report) {
  const flag = r.scale > 1.6 ? "  <-- soft" : "";
  console.log(
    `  ${r.file.padEnd(22)} ${r.ink.padEnd(9)} -> ${r.out.padEnd(11)} ${r.scale.toFixed(2)}x${flag}`,
  );
}
const scales = report.map((r) => r.scale);
console.log(
  `\n  ${report.length} marks normalised to a constant ${TARGET_AREA}px² of ink.`,
);
console.log(
  `  upscale worst ${Math.max(...scales).toFixed(2)}x · best ${Math.min(...scales).toFixed(2)}x`,
);
