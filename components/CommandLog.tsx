"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { AuditRecord } from "@/lib/types";
import { truncateHex } from "@/lib/format";

const ACTION_COLOR: Record<string, string> = {
  create_watchlist: "text-primary",
  activate_watchlist: "text-primary",
  submit_snapshot: "text-cyan",
  assess_snapshot: "text-cyan",
  publish_alert: "text-warning",
  challenge_snapshot: "text-warning",
  resolve_challenge: "text-warning",
  file_appeal: "text-warning",
  resolve_appeal: "text-warning",
  resolve_watchlist: "text-primary",
  archive_watchlist: "text-muted",
};

/** Terminal-style command log stream rendered from audit records. */
export function CommandLog({ records, height = 460 }: { records: AuditRecord[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const sorted = [...records].sort((a, b) => Number(b.at) - Number(a.at));

  useEffect(() => {
    if (!ref.current) return;
    const lines = ref.current.querySelectorAll("[data-logline]");
    gsap.fromTo(lines, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.22, stagger: 0.03, ease: "power1.out" });
  }, [records]);

  return (
    <div ref={ref} className="terminal flex flex-col overflow-y-auto p-3 font-mono text-xs leading-relaxed" style={{ height }}>
      <div className="mb-1 text-muted">$ tail -f source-pulse.events</div>
      {sorted.length === 0 ? (
        <div className="flex items-center gap-2 text-muted">no events yet <span className="inline-block h-3 w-1.5 bg-primary animate-blink" /></div>
      ) : (
        sorted.map((r) => (
          <div key={r.auditId} data-logline className="flex flex-wrap items-baseline gap-x-2 border-b border-line/40 py-1">
            <span className="text-muted">[{String(r.at).padStart(3, "0")}]</span>
            <span className={ACTION_COLOR[r.action] ?? "text-text"}>{r.action}</span>
            <span className="text-muted">·</span>
            <span className="text-text/80">{r.statusAfter}</span>
            {r.snapshotId && <span className="text-muted">snap#{r.snapshotId}</span>}
            {r.alertId && <span className="text-warning">alert#{r.alertId}</span>}
            {r.summary && <span className="w-full truncate pl-1 text-muted">↳ {r.summary}</span>}
            <span className="w-full pl-1 text-[10px] text-muted/70">by {truncateHex(r.actor, 6, 4)}</span>
          </div>
        ))
      )}
      <div className="mt-1 flex items-center gap-1 text-primary">$ <span className="inline-block h-3 w-1.5 bg-primary animate-blink" /></div>
    </div>
  );
}
