import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* The trusted-partner marks. Sources live in /public/clients/webp; the strip
   draws the normalised copies `scripts/normalize-client-logos.mjs` writes to
   /public/clients/optimized, named after each source in lower-case slug form.

   Names were read off the artwork, not the filenames, which mislead: `GCPT`
   is ChainGPT, `systems` is Systems Limited, `Aljazeera` is Al Jazeera Finance
   and not the broadcaster, and `dubai-world-trade1` is the Dubai World Trade
   Centre mark. Five marks carry no legible name (Deline Media, Mammoth,
   HTMLPro, SkillYah, Intensivate) and are named from their files and
   the earlier client list. `EstateOffice` is Pakistan's state emblem, named
   for the Ministry of Housing & Works, because that is the client (see the
   REstate case study), not the emblem.

   Strongest marks lead, so the first thing entering the frame is the most
   recognisable. Shown in their own colours — no plate, no filter. */
const CLIENTS: { name: string; file: string }[] = [
  { name: "Mayo Clinic", file: "mayo-clinic-logo.webp" },
  { name: "Ernst & Young", file: "ey.webp" },
  { name: "Saudi Telecom Company", file: "stc.webp" },
  { name: "Del Monte", file: "del-monte-logo.webp" },
  { name: "Dubai World Trade Centre", file: "dubai-world-trade1.webp" },
  { name: "Manchester Metropolitan University", file: "manchester.webp" },
  { name: "Systems Limited", file: "systems.webp" },
  { name: "Jazz", file: "jazz-logo.webp" },
  { name: "Al Jazeera Finance", file: "aljazeera.webp" },
  { name: "Ministry of Housing & Works", file: "estateoffice.webp" },
  { name: "ChainGPT", file: "gcpt.webp" },
  { name: "Wateen", file: "wateen.webp" },
  { name: "VNClagoon", file: "vnc.webp" },
  { name: "TechVista", file: "techvista.webp" },
  { name: "LodgeiT", file: "lodgeit.webp" },
  { name: "AIVM", file: "aivm.webp" },
  { name: "Software Pro Group of Companies", file: "softwaepro.webp" },
  { name: "PiñaTech", file: "pinatech.webp" },
  { name: "Normies", file: "normies.webp" },
  { name: "Mammoth", file: "mammoth-ai.webp" },
  { name: "XHumanity", file: "xhumanity.webp" },
  { name: "InChannelAI", file: "libbi.webp" },
  { name: "CattleKit", file: "cattlekit.webp" },
  { name: "Intensivate", file: "intensivate.webp" },
  { name: "SkillYah", file: "skillyah.webp" },
  { name: "Deline Media", file: "deline.webp" },
  { name: "HTMLPro", file: "htmlpro.webp" },
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
            className="group/cell relative flex h-[140px] w-[180px] flex-none flex-col items-center justify-center gap-0 border-r border-line px-4 lg:h-[164px] lg:w-[220px] lg:px-6"
          >
            {/* From /clients/optimized, not /clients/webp. The sources arrive at
                every size and with any amount of whitespace inside the file, so
                `scripts/normalize-client-logos.mjs` trims each one to its own
                ink and rescales it to a constant ink AREA, which is what the eye
                measures, on one 480x270 canvas. That leaves nothing for this
                element to decide: one fixed 16:9 box, the same for every mark,
                each already the same weight inside it.

                The canvas is 3x the desktop box (160x90), so the marks are
                drawn from real pixels on 2x and 3x screens rather than
                upscaled. The client's name sits under its mark. */}
            {/* The name below says who it is, so the mark itself is decorative. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/clients/optimized/${client.file}`}
              alt=""
              loading="lazy"
              decoding="async"
              width={480}
              height={270}
              className="h-[54px] w-[96px] flex-none object-contain lg:h-[76px] lg:w-[136px]"
            />
            {/* A fixed two-line slot, so a long name and a short one leave the
                marks level across the strip. Narrower than the cell, to stay
                clear of the corner arrow. */}
            <span className="flex h-[30px] max-w-[124px] items-start justify-center lg:max-w-[160px]">
              <span className="line-clamp-2 text-center text-[11.5px] font-medium leading-[1.3] tracking-[-0.005em] text-ink-500 transition-colors duration-300 group-hover/cell:text-ink">
                {client.name}
              </span>
            </span>

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
export function TrustedStrip({ className }: { className?: string }) {
  return (
    /* Stacks below sm. As a row at every width, the plate is `flex-none` with
       no cap under `lg`, so it sizes to its own text — on a 375px phone that
       is most of the line, and the marquee it sits next to gets squeezed into
       a sliver too narrow to read a logo in. Above the marks instead, each
       gets the full width. */
    <div
      className={cn(
        "flex flex-col items-stretch border-t border-line sm:flex-row",
        className,
      )}
    >
      {/* The fixed plate. */}
      <div className="flex flex-none items-center border-b border-line pr-5 py-6 sm:border-b-0 sm:border-r sm:pr-10 sm:py-8 lg:max-w-[300px]">
        <p className="text-[14px] font-medium leading-[1.55] text-ink lg:text-[15px]">
          Trusted by <br className="" />
          <span className="text-amber-ink">Leading Organizations</span>
          {/* <br className="hidden sm:block" /> across four continents */}
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
