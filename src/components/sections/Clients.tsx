import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* The trusted-partner marks, from /public/clients/webp. Names were read off the
   artwork, not off the filenames — several of those lie: `mental.webp` is Metal
   World, `solution.webp` is solutions by stc, `system.webp` is Systems Limited.
   The later batch caught two more: `amd.webp` is AMD Telecom and not the chip
   company, and `aljazeera.webp` is Al Jazeera Finance and not the broadcaster.
   Naming either from its filename would have put a claim on the page that
   isn't true, so every mark here was opened and read before it was listed.
   `intensivate` and `skillyah` are the two with no wordmark at all — those
   names come from the filename because there is nothing in the artwork to
   check them against.

   Strongest marks lead, so the first thing entering the frame is the most
   recognisable. Shown in their own colours — no plate, no filter. */
const CLIENTS: { name: string; file: string }[] = [
  { name: "Amazon Web Services", file: "aws.webp" },
  { name: "EY", file: "ey.webp" },
  { name: "Dubai World Trade Centre", file: "dwtc.webp" },
  { name: "solutions by stc", file: "solution.webp" },
  { name: "Manchester Metropolitan University", file: "manchester.webp" },
  { name: "Systems Limited", file: "system.webp" },
  { name: "Al Jazeera Finance", file: "aljazeera.webp" },
  { name: "Jazz", file: "jazz.webp" },
  { name: "Wateen Telecom", file: "wateen.webp" },
  { name: "Pakistan Software Export Board", file: "pseb.webp" },
  { name: "P@SHA", file: "pasha.webp" },
  { name: "FAST", file: "fast.webp" },
  { name: "Ministry of Health & Wellness", file: "mohw-logo.webp" },
  { name: "TechVista", file: "techvista.webp" },
  { name: "LodgeiT", file: "lodgeit.webp" },
  { name: "VNClagoon", file: "vnc.webp" },
  { name: "PiñaTech", file: "pinatech.webp" },
  { name: "Intensivate", file: "intensivate.webp" },
  { name: "AMD Telecom", file: "amd.webp" },
  { name: "SkillYah", file: "skillyah.webp" },
  { name: "GZ Tech", file: "gz.webp" },
  { name: "Nexsys", file: "nexsys.webp" },
  { name: "NxEnter", file: "nxenter.webp" },
  { name: "Napollo", file: "napollo.webp" },
  { name: "Mammoth", file: "mammoth-au.webp" },
  { name: "XHumanity", file: "xhumanity.webp" },
  { name: "Deline Media", file: "deline-media.webp" },
  { name: "QuickBills", file: "quick-bills.webp" },
  { name: "ShopifyPro", file: "shopifypro.webp" },
  { name: "SoftwarePro", file: "software-pro.webp" },
  { name: "HTMLPro", file: "htmlpro.webp" },
  { name: "Berks Insulation", file: "berks-insulation.webp" },
];

/** One pass of the marquee — a run of logo cells. Rendered twice so the strip
    loops without a seam; the second copy is hidden from assistive tech. Every
    third cell carries the amber underline + corner arrow for rhythm; the rest
    light up on hover. */
function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex flex-none">
      {CLIENTS.map((client, i) => {
        const accent = i % 3 === 2;
        return (
          <span
            key={`${client.name}-${i}`}
            className="group/cell relative flex h-[128px] w-[180px] flex-none items-center justify-center border-r border-line px-8 lg:w-[220px]"
          >
            {/* From /clients/optimized, not /clients/webp. The delivered files
                are all 120x120 and look uniform, but the ink inside them runs
                from 21% of the canvas to 85% — so at identical CSS they rendered
                4.1x apart. `scripts/normalize-client-logos.mjs` trims each one to
                its own ink and rescales it to a constant ink AREA, which is what
                the eye actually measures. That leaves nothing for this element to
                decide: one fixed box, every mark already the same weight inside
                it.

                The box is deliberately half the canvas (100x56 of 200x112), so
                the strip is drawing these at 2x on a retina screen. The old
                `lg:max-h-[100px]` asked a 120px file for 200 device pixels and
                got a 1.67x upscale — that was the blur. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/clients/optimized/${client.file}`}
              alt={ariaHidden ? "" : client.name}
              title={client.name}
              loading="lazy"
              width={200}
              height={112}
              className="h-[40px] w-[72px] object-contain lg:h-[112px] lg:w-[150px]"
            />

            {/* Amber underline — static on the accented cells, drawn in on hover
                for the rest. */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-amber transition-transform duration-300 ease-expo",
                accent
                  ? "scale-x-100"
                  : "scale-x-0 group-hover/cell:scale-x-100",
              )}
            />
            <ArrowUpRight
              size={14}
              aria-hidden
              className={cn(
                "absolute bottom-2.5 right-3 text-amber transition-opacity duration-300",
                accent
                  ? "opacity-100"
                  : "opacity-0 group-hover/cell:opacity-100",
              )}
            />
          </span>
        );
      })}
    </div>
  );
}

/**
 * The client wall as a running strip: a fixed "trusted by" plate on the left,
 * then the marks looping past it in their own colours. Its own light band, sat
 * between the dark results chapter above and the industries below.
 */
/** The trusted-partner strip — a fixed plate and the marks looping past it in
    their own colours. Rendered at the foot of the About/Proof section rather
    than as a band of its own. */
export function TrustedStrip() {
  return (
    /* Stacks below sm. As a row at every width, the plate is `flex-none` with
       no cap under `lg`, so it sizes to its own text — on a 375px phone that
       is most of the line, and the marquee it sits next to gets squeezed into
       a sliver too narrow to read a logo in. Above the marks instead, each
       gets the full width. */
    <div className="flex flex-col items-stretch border-t border-line sm:flex-row">
      {/* The fixed plate. */}
      <div className="flex flex-none items-center border-b border-line pr-5 py-6 sm:border-b-0 sm:border-r sm:pr-10 sm:py-8 lg:max-w-[300px]">
        <p className="text-[14px] font-medium leading-[1.55] text-ink lg:text-[15px]">
          Trusted by <span className="text-amber-ink">enterprise teams</span>
          <br className="hidden sm:block" /> across four continents
        </p>
      </div>

      {/* The running marks. Pauses on hover so a cell can be read. */}
      <div className="marquee-mask group/m relative min-w-0 flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee group-hover/m:[animation-play-state:paused]">
          <Row />
          <Row ariaHidden />
        </div>
      </div>
    </div>
  );
}
