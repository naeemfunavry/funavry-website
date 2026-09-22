import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Section eyebrow: an azure hairline and a mono label. */
export function Eyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px w-10 flex-none bg-azure" />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
        {label}
      </span>
    </div>
  );
}

/** The mono "read more" link that closes a section's intro column. */
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-azure-ink"
    >
      {children}
      <ArrowRight
        size={13}
        className="transition-transform duration-300 ease-expo group-hover:translate-x-1"
      />
    </Link>
  );
}
