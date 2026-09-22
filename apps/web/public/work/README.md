# Case Studies showcase — hands asset

Drop the hands image here as **`hands.webp`** (or change `HANDS.src` in
`src/components/sections/WorkShowcase.tsx`). Until the file exists, the
showcase hides the layer automatically and the tablet floats.

## Asset spec

- **Subject:** two hands holding a **landscape** tablet, shot/rendered roughly
  head-on with a slight tilt (to match the device's resting perspective).
- **Tablet area:** left **empty / fully transparent** — the site renders the
  real device (frame + live case-study screen) on top, seated in the grip. Do
  not bake a screen or a second tablet into the image.
- **Format:** transparent **PNG or WebP** (WebP preferred for weight).
- **Size:** ~**2000 px wide**, transparent background, hands centred so the grip
  brackets the middle of the frame.
- **Look:** soft, slightly shadowed, neutral skin tones — no harsh studio
  lighting, matching the section's minimal light field.

## Tuning after drop-in

In `WorkShowcase.tsx`, adjust the `HANDS` constant:

- `widthPct` — asset width as a share of the stage (default `132`).
- `offsetYPct` — vertical nudge to seat the device into the grip (default `5`).

The layer only renders on `md` and up; mobile keeps the floating tablet.
