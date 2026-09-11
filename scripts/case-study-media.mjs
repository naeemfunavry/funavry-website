/**
 * Records the pixel size of every case-study capture.
 *
 * The Work page composes each project's captures into a product visual — a
 * browser window, a phone, a supporting panel — and which of those a capture
 * becomes depends on its shape: a 1080x2436 capture is a phone screen, a
 * 1918x829 one is a dashboard, a 700x250 one is a crop of an interface. The
 * captures are referenced by path string in `case-study-details.ts`, which
 * carries no dimensions, so this writes them to a manifest the page reads at
 * build time instead of every component guessing.
 *
 * EXIF orientation is honoured (a portrait phone JPEG stored landscape is
 * recorded portrait), because that is how both the browser and next/image
 * render it.
 *
 * Run after adding or replacing a capture:
 *   node scripts/case-study-media.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PUBLIC = "public";
const DIR = "public/case-studies";
const OUT = "src/lib/case-study-media.json";

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );

const files = walk(DIR)
  .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
  .sort();

const media = {};

for (const file of files) {
  const meta = await sharp(file).metadata();
  let { width, height } = meta;
  if (!width || !height) continue;
  if ((meta.orientation ?? 1) >= 5) [width, height] = [height, width];

  const key = "/" + path.relative(PUBLIC, file).split(path.sep).join("/");
  media[key] = [width, height];
}

fs.writeFileSync(OUT, JSON.stringify(media, null, 2) + "\n");
console.log(`${Object.keys(media).length} captures -> ${OUT}`);
