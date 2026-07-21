import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { OFFICES } from "@/lib/offices";
import { SOCIALS } from "@/lib/socials";

/** The footer index mirrors the delivery model, not a generic sitemap. */
const COLUMNS: {
  n: string;
  title: string;
  accent: string;
  links: { label: string; href: string }[];
}[] = [
  {
    n: "01",
    title: "Build",
    accent: "bg-azure",
    links: [
      { label: "Digital Engineering", href: "#capabilities" },
      { label: "Data & Business Intelligence", href: "#capabilities" },
      { label: "Blockchain & FinTech", href: "#capabilities" },
      { label: "Immersive Technologies", href: "#capabilities" },
      { label: "Robotics, IoT & Vision", href: "#capabilities" },
      { label: "Quality Engineering", href: "#capabilities" },
    ],
  },
  {
    n: "02",
    title: "Automate",
    accent: "bg-amber",
    links: [
      { label: "Artificial Intelligence", href: "#capabilities" },
      { label: "Intelligent Automation", href: "#capabilities" },
      { label: "Document Intelligence", href: "#capabilities" },
      { label: "AI Process Transformation", href: "#capabilities" },
      { label: "Process Mining", href: "#capabilities" },
    ],
  },
  {
    n: "03",
    title: "Operate",
    accent: "bg-steel",
    links: [
      { label: "Managed Services", href: "#capabilities" },
      { label: "Cloud, DevOps & Security", href: "#capabilities" },
      { label: "GBS & Operating Models", href: "#capabilities" },
      { label: "GCC Advisory", href: "#capabilities" },
      { label: "Finance Transformation", href: "#capabilities" },
      { label: "EOR, BOT & Global Teams", href: "#capabilities" },
    ],
  },
  {
    n: "04",
    title: "Company",
    accent: "bg-ink",
    links: [
      { label: "Capabilities", href: "#capabilities" },
      { label: "Industries", href: "#industries" },
      { label: "Work", href: "#work" },
      { label: "Technology", href: "#technology" },
      { label: "Careers", href: "#careers" },
      { label: "Blog & News", href: "#insights" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-paper">
      <Container wide className="relative z-10 pt-16 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
          {/* Identity. */}
          <div>
            <a
              href="/"
              aria-label="Funavry Technologies home"
              className="text-ink"
            >
              <Logo className="h-8" />
            </a>
            <p className="mt-7 max-w-[34ch] text-[14.5px] leading-[1.75] text-ink-400">
              AI-first technology and Global Business Services. We build modern
              platforms, automate the work inside them, and operate them at
              global scale.
            </p>

            <div className="mt-8 flex items-center">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Funavry on ${s.label}`}
                    className="-ml-px flex h-11 w-11 items-center justify-center border border-line text-ink-500 transition-colors duration-300 first:ml-0 hover:bg-ink hover:text-paper"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-px">
              {[
                ["2018", "Founded"],
                ["500+", "Projects"],
                ["200+", "People"],
              ].map(([v, l]) => (
                <div key={l} className="bg-paper pr-4 pt-4 ">
                  <dt className="text-[19px] font-medium leading-none tracking-[-0.02em] text-ink">
                    {v}
                  </dt>
                  <dd className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Index, drafted by phase. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <div className="flex items-center gap-2.5 border-b border-line pb-3">
                  <span aria-hidden className={`h-1.5 w-1.5 ${col.accent}`} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {col.title}
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-[13px] leading-snug text-ink-400 transition-colors duration-200 hover:text-ink"
                      >
                        <span
                          aria-hidden
                          className="h-px w-0 flex-none bg-ink transition-all duration-400 ease-expo group-hover:w-3"
                        />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Global delivery footprint — the offices, with addresses. */}
        <div className="mt-16 border-t border-line pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Global delivery
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {OFFICES.map((o) => (
              /* Headed by city, not country. There are two Pakistani offices
                 now, and country alone both repeated the heading and collided
                 the keys — the flag and the address carry the country. */
              <div key={o.city}>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {o.city}
                  </h3>
                  <span className="text-[13px] text-ink-400">({o.role})</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.flag}
                    alt={`${o.country} flag`}
                    loading="lazy"
                    className="h-4 w-6 flex-none object-cover ring-1 ring-line-strong"
                  />
                </div>
                <address className="mt-3 space-y-0.5 text-[14px] not-italic leading-[1.65] text-ink-500">
                  {o.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-line py-7 sm:flex-row">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
            © {new Date().getFullYear()} Funavry Technologies
          </p>
        </div>
      </Container>

      {/* The logo's sweep closes the page. */}
      <div aria-hidden className="h-1 w-full bg-phases" />
    </footer>
  );
}
