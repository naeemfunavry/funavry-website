/**
 * Re-encodes the industry photographs from JPEG to WebP.
 *
 * The delivered files are ten 800x1000 JPEGs in /public/industries, 1.2MB
 * between them, and they were the largest thing in the repo after the case
 * study captures. Unlike `crop-case-studies.mjs` this does not crop or resize:
 * 800px wide is already the right source for these tiles. The deck renders them
 * at `sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"`, so the
 * widest real request is ~480 CSS px, and 800px is what covers that at 2x
 * without upscaling. Shrinking them would cost retina sharpness for bytes the
 * user never downloads anyway.
 *
 * Quality 82, not the 90 the case-study script uses. That 90 exists because
 * those captures are dashboards and the first thing a lower quality spends its
 * budget on is 10px table text. These are photographs sitting behind a scrim
 * with a heading over them — there is no fine type in them to protect, and 82
 * is where WebP stops paying for detail this material doesn't have.
 *
 * The JPEG sources are deleted once converted. They are tracked in git, so the
 * originals are recoverable exactly:
 *   git show HEAD:public/industries/<name>.jpg > <name>.jpg
 *
 * Run after adding or replacing an industry photograph:
 *   node scripts/optimize-industries.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = "public/industries";
const QUALITY = 82;

const sources = fs
  .readdirSync(DIR)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

if (sources.length === 0) {
  console.log("Nothing to do — no JPEGs left in " + DIR + ".");
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of sources) {
  const src = path.join(DIR, file);
  const out = path.join(DIR, file.replace(/\.jpe?g$/i, ".webp"));

  const meta = await sharp(src).metadata();
  await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(out);

  const inKb = fs.statSync(src).size / 1024;
  const outKb = fs.statSync(out).size / 1024;
  before += inKb;
  after += outKb;

  // Only unlink once the WebP is on disk and non-empty.
  if (fs.statSync(out).size > 0) fs.unlinkSync(src);

  console.log(
    `${file.padEnd(22)} ${meta.width}x${meta.height}  ` +
      `${inKb.toFixed(0).padStart(4)}KB -> ${outKb.toFixed(0).padStart(4)}KB  ` +
      `(-${(100 - (outKb / inKb) * 100).toFixed(0)}%)`,
  );
}

console.log(
  `\n${sources.length} files  ${before.toFixed(0)}KB -> ${after.toFixed(0)}KB  ` +
    `(-${(before - after).toFixed(0)}KB, -${(100 - (after / before) * 100).toFixed(0)}%)`,
);
console.log("Remember: /public/industries paths in src/lib/industries.ts.");
