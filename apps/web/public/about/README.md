# Life at Funavry — company photographs

The company's own photographs. Four places draw from this folder:

- **About page gallery** — `GALLERY` in `src/app/about/page.tsx`. Takes any
  number of photos, portrait or landscape; each keeps its own shape, so list
  every photo with its pixel `width` and `height`.
- **Life @ Funavry page** � `MOMENTS` in `src/app/life-at-funavry/page.tsx`.
  A filterable bento: the first photo leads at twice the size, the rest are
  cropped to fill their tiles, and each `category` becomes a filter chip.
- **Home page slider** — `SLIDES` in `src/components/sections/Proof.tsx`. The
  frame crops to 16:10, so use landscape group shots here.
- **About page hero** — the `image` passed to `PageHero` in
  `src/app/about/page.tsx`. Needs a large landscape photo (2000 px wide or
  more); it sits under a dark wash, so a darker photo holds up best.

## Adding a photo

1. Drop it here with a plain file name — no spaces or brackets, since the name
   becomes the URL (`14.webp`, not `IMG-2025 (2).webp`).
2. List it where it should appear, with an `alt` that describes what the photo
   shows and a short `caption`.
3. Say only what the picture shows. Don't name a place or an event unless it
   is certain.

## Asset spec

- **Format:** WebP preferred, JPEG acceptable.
- **Size:** 1600 px wide or more; `next/image` resizes for each screen, so a
  large original costs nothing on the page.
- **Look:** natural light, neutral colour, no heavy filters.
