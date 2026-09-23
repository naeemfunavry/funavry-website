import { MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import type { Office } from "@/lib/offices";
import { socialColor, socialIcon } from "@/lib/socials";

/** The footer leads with the head office. Only the footer is reordered — the
    About page and the globe keep the CMS order. A city not listed here keeps
    its CMS position after these. */
const OFFICE_ORDER = ["Islamabad", "Riyadh", "New York"];

/** The flags ship with the site in /public/flags, so the footer takes them
    from there by country rather than trusting the CMS media URL, which can be
    empty or point at an API that isn't up. The CMS flag is only the fallback
    for a country not listed here. */
const LOCAL_FLAGS: Record<string, string> = {
  Pakistan: "/flags/pk.svg",
  "Saudi Arabia": "/flags/sa.svg",
  "United States": "/flags/us.svg",
};

const flagFor = (o: Office) => LOCAL_FLAGS[o.country] ?? o.flag;

function orderOffices(offices: Office[]): Office[] {
  const rank = (o: Office) => {
    const i = OFFICE_ORDER.indexOf(o.city);
    return i === -1 ? OFFICE_ORDER.length : i;
  };
  return [...offices].sort((a, b) => rank(a) - rank(b));
}

// "Our Entities" has no page yet — it points at "#" until one exists.
const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Entities", href: "#" },
  { label: "Careers", href: "#careers" },
  { label: "Blog & News", href: "/blog" },
];

// The legal pages don't exist yet either; only the sitemap is real.
const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "Cookie Policy", href: "#" },
];

/** A column heading — the site's mono label over a short amber rule. */
function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
        {children}
      </h2>
      <span aria-hidden className="mt-3 block h-px w-10 bg-amber" />
    </div>
  );
}

/**
 * Data arrives as props rather than being imported.
 *
 * The footer renders on every page, and every one of those pages is a server
 * component that already fetches from the CMS — so the offices and social
 * links come down with the page rather than this file reaching for a module
 * constant that no longer exists.
 */
export interface FooterProps {
  offices: Office[];
  /** Still passed by every page; the footer no longer lists them. */
  deliveryCountries: string[];
  socials: { label: string; href: string; icon: string }[];
}

export default function Footer({ offices, socials }: FooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-paper">
      <Container wide className="relative z-10 pt-16 lg:pt-20">
        {/* Identity | Company | Offices, split by hairlines from lg. */}
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,340px)_minmax(0,200px)_minmax(0,1fr)] lg:gap-0">
          {/* Identity. */}
          <div className="md:col-span-2 lg:col-span-1 lg:pr-12">
            <a
              href="/"
              aria-label="Funavry Technologies home"
              className="text-ink"
            >
              <Logo className="h-8" />
            </a>
            <p className="mt-7 max-w-[36ch] text-[14.5px] leading-[1.75] text-ink-400">
              AI-first technology and Global Business Services. We build modern
              platforms, automate the work inside them, and operate them at
              global scale.
            </p>

            <div className="mt-8 flex items-center gap-2.5">
              {socials.map((s) => {
                const Icon = socialIcon(s.icon);
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Funavry on ${s.label}`}
                    style={{ background: socialColor(s.icon) }}
                    className="flex h-11 w-11 rounded-full items-center justify-center text-white transition-[transform,opacity] duration-300 ease-expo hover:-translate-y-0.5 hover:opacity-90"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company. */}
          <nav
            aria-label="Company"
            className="lg:border-l lg:border-line lg:px-12"
          >
            <ColumnTitle>Company</ColumnTitle>
            <ul className="mt-6 space-y-3.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[14px] leading-snug text-ink-400 transition-colors duration-200 hover:text-ink"
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

          {/* Offices. */}
          <div className="lg:border-l lg:border-line lg:pl-12">
            <ColumnTitle>Our Global Offices</ColumnTitle>
            <div className="mt-6 grid gap-8 sm:grid-cols-3 sm:gap-6 xl:gap-10">
              {orderOffices(offices).map((o) => (
                /* Headed by city, which is unique; the flag carries the
                   country. */
                <div key={o.city}>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      strokeWidth={1.8}
                      className="mt-0.5 flex-none text-azure"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                          {o.city}
                        </h3>
                        {flagFor(o) && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={flagFor(o)}
                            alt={`${o.country} flag`}
                            width={24}
                            height={16}
                            loading="lazy"
                            className="h-4 w-6 flex-none object-cover ring-1 ring-line-strong"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-400">
                        ({o.role})
                      </p>
                    </div>
                  </div>
                  <address className="mt-4 space-y-0.5 pl-6 text-[13.5px] not-italic leading-[1.65] text-ink-500">
                    {o.address.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </address>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright left, legal links right. */}
        <div className="mt-14 flex flex-col gap-4 border-t border-line py-7 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
            © {new Date().getFullYear()} Funavry Technologies
          </p>
          <ul className="flex flex-wrap items-center gap-y-2">
            {LEGAL_LINKS.map((link, i) => (
              <li key={link.label} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="mx-4 h-3 w-px bg-line-strong" />
                )}
                <a
                  href={link.href}
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500 transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* The logo's sweep closes the page. */}
      <div aria-hidden className="h-1 w-full bg-phases" />
    </footer>
  );
}
