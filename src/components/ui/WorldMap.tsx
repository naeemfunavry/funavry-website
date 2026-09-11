import { LAND_RINGS } from "@/lib/globe-geometry";
import { OFFICES } from "@/lib/offices";
import { cn } from "@/lib/utils";

/**
 * A flat, equirectangular delivery map — the company profile's world silhouette,
 * with a pin on each office.
 *
 * It draws the *same* Natural Earth land the 3D globe uses, so there is one
 * source of geometry, not two. The globe projects those lon/lat points onto a
 * sphere; here we project them straight onto a rectangle, which is all a flat
 * map is. No hooks, no measuring — the paths are computed once at module load,
 * so this renders on the server as static SVG.
 */

/* Framed to a latitude band that drops empty Antarctica and the polar caps —
   the same crop the profile map uses, so the continents fill the frame. */
const W = 1000;
const LAT_TOP = 82;
const LAT_BOTTOM = -56;
const H = (W * (LAT_TOP - LAT_BOTTOM)) / 360; // equirectangular keeps degrees square

const px = (lon: number) => ((lon + 180) / 360) * W;
const py = (lat: number) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H;

/* Project every land ring to a path once. A ring that steps more than 180° in
   longitude has jumped the dateline; on a flat map that would draw a streak
   clear across the world, so we lift the pen (M) rather than draw the line (L)
   at the seam. */
const LAND_PATHS = LAND_RINGS.map((ring) => {
  let d = "";
  let prevLon = 0;
  for (let i = 0; i < ring.length; i += 2) {
    const lon = ring[i];
    const lat = ring[i + 1];
    const cmd = i === 0 || Math.abs(lon - prevLon) > 180 ? "M" : "L";
    d += `${cmd}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`;
    prevLon = lon;
  }
  return d + "Z";
});

/* Where each label sits relative to its pin, so the two close Gulf/South-Asia
   markers don't collide. */
const LABEL_BELOW = new Set(["Riyadh"]);

export default function WorldMap({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Funavry global delivery map, with offices in New York, Riyadh and Islamabad"
      >
        <g className="fill-[#C0C6C2]">
          {LAND_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {OFFICES.map((o) => {
          const x = px(o.at.lon);
          const y = py(o.at.lat);
          return (
            <g key={o.city}>
              <circle cx={x} cy={y} r={11} className="fill-amber/20" />
              <circle
                cx={x}
                cy={y}
                r={5}
                className="fill-amber stroke-paper-white"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels as HTML pills — crisp text and a proper drop shadow, positioned
          as a percentage of the same box the SVG fills. */}
      {OFFICES.map((o) => {
        const xPct = (px(o.at.lon) / W) * 100;
        const yPct = (py(o.at.lat) / H) * 100;
        const below = LABEL_BELOW.has(o.city);
        return (
          <div
            key={o.city}
            className="pointer-events-none absolute z-10"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: `translate(-50%, ${
                below ? "16px" : "calc(-100% - 16px)"
              })`,
            }}
          >
            <span className="block whitespace-nowrap rounded-md border border-line bg-paper-white px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] text-ink shadow-[0_8px_18px_-10px_rgba(46,52,54,0.6)]">
              {o.city}
            </span>
          </div>
        );
      })}
    </div>
  );
}
