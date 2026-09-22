"use client";

import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/ui/logo";
import { NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { can, hasRole } = useAuth();

  /* An item is current when the path matches it exactly, or when it is a
     parent of the current path — so /dashboard/case-studies/new keeps its nav
     item lit. Guarded against "/dashboard" matching everything. */
  const isCurrent = (href: string): boolean =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <>
      {/* Scrim, mobile only. */}
      {open && (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink-900/20 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[15.5rem] flex-col border-r border-line bg-paper-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo className="h-5 w-auto" />
            <span className="text-sm font-semibold tracking-tight">
              Funavry<span className="text-ink-400"> CMS</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="btn-ghost btn-sm lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {NAVIGATION.map((section) => {
            const visible = section.items.filter(
              (item) =>
                (!item.permissions || can(...item.permissions)) &&
                (!item.roles || hasRole(...item.roles)),
            );

            /* A section whose every item is hidden should not leave its heading
               floating over nothing. */
            if (visible.length === 0) return null;

            return (
              <div key={section.title} className="mb-5 last:mb-0">
                <p className="eyebrow px-2 pb-1.5">{section.title}</p>

                <ul className="space-y-0.5">
                  {visible.map((item) => {
                    const current = isCurrent(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-2.5 px-2 py-1.5 text-sm transition-colors",
                            current
                              ? "bg-paper-deep font-medium text-ink"
                              : "text-ink-500 hover:bg-paper-deep/60 hover:text-ink",
                          )}
                        >
                          {/* The active marker is a rule in the brand azure —
                              the same device the site uses for section labels. */}
                          <span
                            aria-hidden
                            className={cn(
                              "h-4 w-0.5 shrink-0 transition-colors",
                              current ? "bg-azure" : "bg-transparent",
                            )}
                          />
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              current ? "text-azure-ink" : "text-ink-400",
                            )}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-line p-3">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-ink-400 transition-colors hover:text-ink"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View funavry.com
          </a>
        </div>
      </aside>
    </>
  );
}
