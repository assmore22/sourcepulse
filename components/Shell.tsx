"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot } from "@fortawesome/free-solid-svg-icons";
import { SourcePulseLogo } from "./SourcePulseLogo";
import { WalletConnect } from "./WalletConnect";
import { hasContract, CONTRACT } from "@/lib/sourcepulse";
import { CHAIN_ID } from "@/lib/studionet";
import { Hex } from "./ui";

const NAV = [
  { href: "/", cmd: ":monitor" },
  { href: "/submit", cmd: ":submit" },
  { href: "/alerts", cmd: ":alerts" },
  { href: "/disputes", cmd: ":disputes" },
  { href: "/profile", cmd: ":profile" },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      {/* top status rail */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between gap-3 px-4 lg:px-5">
          <div className="flex items-center gap-5">
            <Link href="/"><SourcePulseLogo /></Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}
                  className={`cmd rounded px-2 py-1 transition-colors ${active(n.href) ? "bg-primary/15 text-primary" : "text-muted hover:bg-panel hover:text-text"}`}>
                  {n.cmd}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 font-mono text-[11px] text-muted lg:flex">
              <FontAwesomeIcon icon={faCircleDot} className="h-2.5 w-2.5 text-primary animate-ticker" /> studionet:{CHAIN_ID}
              <span className="text-line">|</span>
              {hasContract() ? <Hex value={CONTRACT} kind="contract" lead={5} tail={4} /> : <span className="text-warning">no contract</span>}
            </div>
            <WalletConnect />
          </div>
        </div>
        {/* mobile nav row */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`cmd shrink-0 rounded px-2 py-1 ${active(n.href) ? "bg-primary/15 text-primary" : "text-muted"}`}>{n.cmd}</Link>
          ))}
        </nav>
      </header>

      <main className="w-full flex-1">
        {children}
      </main>
    </div>
  );
}
