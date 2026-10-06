# Life at Funavry — company photographs

The company's own photographs. Two places draw from this folder:

- **About page gallery** — `GALLERY` in `src/app/about/page.tsx`. Takes any
  number of photos, portrait or landscape; each keeps its own shape, so list
  every photo with its pixel `width` and `height`.
- **Home page slider** — `SLIDES` in `src/components/sections/Proof.tsx`. The
  frame crops to 16:10, so use landscape group shots here.

The page hero and the Life @ Funavry "Moments" bento no longer draw from
here — they have their own folders: `public/about-us-bg-cover` (About hero),
`public/lifefunavry-bg-cover` (Life hero) and `public/lifefunavry/moments`
(the Moments bento).

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
