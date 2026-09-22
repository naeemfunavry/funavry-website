# About page — company image

Drop the hero photo here and point `ABOUT_IMAGE` in `src/app/about/page.tsx`
at it. Until `ABOUT_IMAGE.src` is set, the frame renders a labelled
placeholder at the same dimensions, so adding the file changes no layout.

```ts
const ABOUT_IMAGE = {
  src: "/about/team.webp",
  alt: "The Funavry team outside the Islamabad engineering and delivery center",
  caption: "Islamabad · 17,000 sq ft engineering & delivery center",
};
```

Set `alt` at the same time — it is empty on purpose while there is no image,
and an image shipped without it is a real accessibility defect. Update
`caption` too if the photo is not the Islamabad centre.

## Asset spec

- **Subject:** the company — the team, or the Islamabad engineering and
  delivery centre. Both appear in the 2026 corporate profile (team group photo,
  building and interior shots) and either suits the slot.
- **Aspect:** **4:3 landscape.** The frame crops with `object-cover`, so keep
  the subject clear of the outer ~8% on each edge.
- **Size:** ~**1600 px wide** (renders at 520 px, 2× for retina).
- **Format:** **WebP** preferred, JPEG acceptable. Aim under ~250 KB.
- **Look:** natural light, neutral colour. It sits on `paper-deep` next to a
  blueprint grid, so avoid heavy filters or a dark, high-contrast grade.
