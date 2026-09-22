/**
 * Normalises the case-study captures into the frame the Work section draws.
 *
 * The sources in /public/case-studies are whatever the delivery teams had:
 * full-page PNGs several thousand pixels tall, 4K photographs, and a couple of
 * small window grabs — no two the same shape. A row of cards only reads as one
 * set if every capture is the same shape, so each is cropped here to 16:10 and
 * written as webp to /public/case-studies/optimized, which is what Work.tsx
 * imports. Sources are never upscaled: a small capture stays small rather than
 * pretending to detail it doesn't have.
 *
 * Run after adding or replacing a screenshot:
 *   node scripts/crop-case-studies.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const SRC = "public/case-studies";
const OUT = "public/case-studies/optimized";
const RATIO = 16 / 10;

/**
 * `anchor` is where the 16:10 window sits when the source is a different shape.
 * `redact` blurs regions of the source before the window is taken, for captures
 * carrying data that shouldn't be legible on a public page.
 */
const JOBS = [
  // 3184x1861, wider than 16:10. Left-anchored: keeps the nav rail, and the
  // right edge it gives up is empty background.
  { out: "qfs.webp", src: `${SRC}/QFS – Quality Inspection/Picture11.jpg`, anchor: "left" },

  // 1501x957, already all but 16:10.
  { out: "global-claims.webp", src: `${SRC}/Global Claims Management System/image (11).png`, anchor: "top" },

  // 1920x2286, a full-page capture. The annotator — the thing worth showing —
  // is the top third; the rest is a grid of search results.
  { out: "contxtual.webp", src: `${SRC}/Contxtual/image_2024_02_16T18_10_44_200Z.png`, anchor: "top" },

  // 1335x592, wider than 16:10. Left-anchored keeps the brand and the whole nav
  // rail — Skillers through Transactions and Disputes, which is the marketplace
  // the copy claims — and gives up the table's Status/Visibility/Actions.
  // Crops to 947px, under the 2000px target: the widest card is ~36vw, so this
  // is short of 2x above a ~1315px viewport. Replace if a larger capture turns
  // up. The Skillers grid is seed data, but the email and phone columns are
  // legible at this size and one address is a real personal account, so both
  // columns are blurred out — same call as the faces dropped from the old
  // whiteboard capture (image_2024_03_25T08_50_59_448Z.png, still in SRC).
  {
    out: "skillyah.webp",
    src: `${SRC}/SkillYah/skillyah.png`,
    anchor: "left",
    // Column headers are left alone; only the values below them are blurred.
    redact: [
      { left: 362, top: 266, width: 248, height: 326 }, // Email
      { left: 864, top: 266, width: 152, height: 326 }, // Phone
    ],
  },

  // 483x718, a full-page portrait capture — the masthead and market tickers sit
  // at the top. Low-resolution: replace it if a better capture turns up.
  { out: "cnbc-arabia.webp", src: `${SRC}/CNBC Arabia News Portal/Picture15.png`, anchor: "top" },

  // 714x421, near enough 16:10. Also low-resolution.
  { out: "smart-municipality.webp", src: `${SRC}/Smart Municipality/service dashboard2.png`, anchor: "center" },
];

fs.mkdirSync(OUT, { recursive: true });

/**
 * Blurs `regions` of `src` and returns the result as a buffer. The sigma is far
 * heavier than it needs to be to soften ~11px table text: the point is that
 * nothing legible survives, not that it looks tastefully out of focus.
 */
async function redact(src, regions) {
  const patches = await Promise.all(
    regions.map(async (region) => ({
      input: await sharp(src).extract(region).blur(12).png().toBuffer(),
      left: region.left,
      top: region.top,
    })),
  );
  return sharp(src).composite(patches).png().toBuffer();
}

for (const job of JOBS) {
  // Redactions are in source coordinates, so they land before the crop window
  // is taken and can be read straight off the full capture.
  const src = job.redact ? await redact(job.src, job.redact) : job.src;
  const img = sharp(src);
  const { width: w, height: h } = await img.metadata();

  const box =
    w / h > RATIO
      ? // Too wide: keep the full height, take a window of the width.
        (() => {
          const width = Math.round(h * RATIO);
          const left = job.anchor === "left" ? 0 : Math.round((w - width) / 2);
          return { left, top: 0, width, height: h };
        })()
      : // Too tall: keep the full width, take a window of the height.
        (() => {
          const height = Math.round(w / RATIO);
          const top = job.anchor === "top" ? 0 : Math.round((h - height) / 2);
          return { left: 0, top, width: w, height };
        })();

  // 2000px is a 2x render of the widest the card ever gets.
  await img
    .extract(box)
    .resize({ width: Math.min(box.width, 2000), withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(`${OUT}/${job.out}`);

  const out = await sharp(`${OUT}/${job.out}`).metadata();
  const kb = (fs.statSync(`${OUT}/${job.out}`).size / 1024).toFixed(0);
  console.log(
    `${job.out.padEnd(26)} ${w}x${h} -> ${out.width}x${out.height}  ${kb}KB`,
  );
}
