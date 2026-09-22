"use client";

import { ChevronDown, KeyRound, LogOut, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn, initialsOf } from "@/lib/utils";

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Closes on an outside click or Escape — a dropdown that only closes when you
     click the trigger again is the kind of small wrongness that makes a tool
     feel unfinished. */
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  /* Longest matching href wins, so /dashboard/case-studies/[id] titles as
     "Case Studies" rather than "Dashboard". */
  const current = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper-white/90 px-4 backdrop-blur-sm lg:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="btn-ghost btn-sm lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <h1 className="text-sm font-medium tracking-tight">{current?.label ?? "Dashboard"}</h1>

      <div className="ml-auto flex items-center gap-2">
        {user?.mustChangePassword && (
          <Link
            href="/account/password"
            className="hidden items-center gap-1.5 border border-amber/40 bg-amber-50 px-2.5 py-1 font-mono text-micro uppercase tracking-[0.08em] text-amber-ink transition-colors hover:bg-amber-100 sm:inline-flex"
          >
            <KeyRound className="h-3 w-3" />
            Change your password
          </Link>
        )}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 border border-line bg-paper-white px-2 py-1 transition-colors hover:bg-paper-deep"
          >
            <span className="flex h-6 w-6 items-center justify-center bg-ink font-mono text-micro text-paper-white">
              {initialsOf(user?.fullName ?? user?.username ?? "?")}
            </span>
            <span className="hidden text-sm sm:inline">{user?.username}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 text-ink-400 transition-transform", menuOpen && "rotate-180")}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-60 border border-line bg-paper-white shadow-pop"
            >
              <div className="border-b border-line px-3 py-2.5">
                <p className="truncate text-sm font-medium">{user?.fullName}</p>
                <p className="truncate text-xs text-ink-400">{user?.email}</p>
                <p className="mt-1.5 flex items-center gap-1 font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
                  <ShieldCheck className="h-3 w-3" />
                  {user?.roles.join(" · ")}
                </p>
              </div>

              <Link
                href="/account/password"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-500 transition-colors hover:bg-paper-deep hover:text-ink"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Change password
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => void signOut()}
                className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
