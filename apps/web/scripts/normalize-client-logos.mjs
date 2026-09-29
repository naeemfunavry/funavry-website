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
 * On sharpness: the canvas is 3x the box the strip draws (160x90 CSS px), so
 * the marks stay crisp on 2x and 3x screens. Most sources are large enough to
 * be downscaled into it; a small one has to be upscaled and cannot gain
 * detail, so the scale factor is printed for every file and anything past
 * 1.6x is flagged. The fix for a flagged mark is a larger original.
 *
 * Output names are slugged from the source ("del monte logo.webp" becomes
 * "del-monte-logo.webp"), and the output folder is cleared first, so a
 * removed source leaves no stale mark behind.
 *
 * Run after adding or replacing a client logo:
 *   node scripts/normalize-client-logos.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/clients/webp";
const OUT = "public/clients/optimized";

/** Output canvas, at 3x the CSS box the strip draws (160x90). */
const CANVAS_W = 480;
const CANVAS_H = 270;

/**
 * Target ink area on that canvas, in px². 40000 = a 200x200 square, so ~67px
 * of optical size in the 160x90 box: about the share of the box the marks have
 * always had, at three times the pixels.
 */
const TARGET_AREA = 40000;

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

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/** "del monte logo.png" -> "del-monte-logo.webp". */
const outName = (f) =>
  f
    .replace(/\.(webp|png|jpe?g)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + ".webp";

// Sources may arrive as PNG or JPEG as well; every output is WebP, named after
// its source.
const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
const report = [];

for (const sourceFile of files) {
  const src = path.join(SRC, sourceFile);
  const file = outName(sourceFile);
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const cleared = clearWhitePlate(data, W, H, C);

  const b = inkBounds(data, W, H, C) ?? alphaBounds(data, W, H, C);
  if (!b) {
    console.warn(`  !! ${file}: no ink found, copied as-is`);
    await sharp(src).resize(CANVAS_W, CANVAS_H, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 95, alphaQuality: 100 }).toFile(path.join(OUT, file));
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
  const maxW = CANVAS_W - 24;
  const maxH = CANVAS_H - 24;
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
    .webp({ quality: 95, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(path.join(OUT, file));

  report.push({ file: cleared ? `${file} (plate)` : file, ink: `${inkW}x${inkH}`, out: `${outW}x${outH}`, scale });
}

report.sort((a, b) => b.scale - a.scale);
console.log(`\n  ${"file".padEnd(28)} ${"ink".padEnd(9)} -> ${"normalised".padEnd(11)} scale`);
for (const r of report) {
  const flag = r.scale > 1.6 ? "  <-- soft" : "";
  console.log(
    `  ${r.file.padEnd(28)} ${r.ink.padEnd(9)} -> ${r.out.padEnd(11)} ${r.scale.toFixed(2)}x${flag}`,
  );
}
const scales = report.map((r) => r.scale);
console.log(
  `\n  ${report.length} marks normalised to a constant ${TARGET_AREA}px² of ink.`,
);
console.log(
  `  upscale worst ${Math.max(...scales).toFixed(2)}x · best ${Math.min(...scales).toFixed(2)}x`,
);
