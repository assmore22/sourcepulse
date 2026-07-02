"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy, faCheck, faArrowUpRightFromSquare, faCircleInfo, faTriangleExclamation,
  faCircleExclamation, faCircleCheck, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { truncateHex, explorerTx, explorerAddr, explorerContract } from "@/lib/format";

const WATCH: Record<string, string> = {
  draft: "border-line text-muted bg-terminal",
  active: "border-primary/50 text-primary bg-primary/10",
  monitoring: "border-primary/50 text-primary bg-primary/10",
  alerting: "border-warning/50 text-warning bg-warning/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  resolved: "border-cyan/50 text-cyan bg-cyan/10",
  archived: "border-line text-muted bg-terminal",
};
const SNAP: Record<string, string> = {
  submitted: "border-line text-muted bg-terminal",
  compared: "border-line text-muted bg-terminal",
  routine: "border-primary/50 text-primary bg-primary/10",
  important: "border-cyan/50 text-cyan bg-cyan/10",
  risky: "border-danger/50 text-danger bg-danger/10",
  suspicious: "border-danger/50 text-danger bg-danger/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  finalized: "border-cyan/50 text-cyan bg-cyan/10",
};
const ALERT: Record<string, string> = {
  proposed: "border-line text-muted bg-terminal",
  published: "border-warning/50 text-warning bg-warning/10",
  dismissed: "border-muted/40 text-muted bg-terminal",
  challenged: "border-warning/50 text-warning bg-warning/10",
  resolved: "border-cyan/50 text-cyan bg-cyan/10",
};
const DECISION: Record<string, string> = {
  open: "border-warning/50 text-warning bg-warning/10",
  upheld: "border-primary/50 text-primary bg-primary/10",
  dismissed: "border-muted/40 text-muted bg-terminal",
  accepted: "border-primary/50 text-primary bg-primary/10",
  denied: "border-danger/50 text-danger bg-danger/10",
};
const SEV: Record<string, string> = {
  low: "border-primary/50 text-primary bg-primary/10",
  medium: "border-cyan/50 text-cyan bg-cyan/10",
  high: "border-warning/50 text-warning bg-warning/10",
  critical: "border-danger/50 text-danger bg-danger/10",
};
const VERDICT: Record<string, string> = {
  routine: "border-primary/50 text-primary bg-primary/10",
  important: "border-cyan/50 text-cyan bg-cyan/10",
  risky: "border-danger/50 text-danger bg-danger/10",
  suspicious: "border-danger/50 text-danger bg-danger/10",
};

export function StatusChip({ status, kind }: { status: string; kind: "watch" | "snapshot" | "alert" | "decision" }) {
  const map = kind === "watch" ? WATCH : kind === "snapshot" ? SNAP : kind === "alert" ? ALERT : DECISION;
  const cls = map[status] ?? "border-line text-muted bg-terminal";
  return <span className={`chip ${cls}`}>{status || "-"}</span>;
}

export function SeverityBadge({ severity }: { severity?: string }) {
  const cls = SEV[severity ?? ""] ?? "border-line text-muted bg-terminal";
  return <span className={`chip ${cls}`}>{severity || "-"}</span>;
}

export function VerdictBadge({ verdict, change, risk }: { verdict?: string; change?: number; risk?: number }) {
  const cls = VERDICT[verdict ?? ""] ?? "border-line text-muted bg-terminal";
  return (
    <span className={`chip ${cls}`}>
      {verdict || "unassessed"}
      {typeof change === "number" && change > 0 ? <span className="mono opacity-80">| c{change}</span> : null}
      {typeof risk === "number" && risk > 0 ? <span className="mono opacity-80">| r{risk}</span> : null}
    </span>
  );
}

export function Copy({ value, className = "" }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label="Copy"
      className={`inline-grid h-6 w-6 place-items-center rounded text-muted transition-colors hover:bg-terminal hover:text-text ${className}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}>
      <FontAwesomeIcon icon={done ? faCheck : faCopy} className={`h-3 w-3 ${done ? "text-primary" : ""}`} />
    </button>
  );
}

export function Hex({ value, kind = "address", lead = 6, tail = 4 }: { value: string; kind?: "address" | "contract" | "tx"; lead?: number; tail?: number }) {
  if (!value) return <span className="text-muted">-</span>;
  const href = kind === "tx" ? explorerTx(value) : kind === "contract" ? explorerContract(value) : explorerAddr(value);
  return (
    <span className="inline-flex items-center gap-1">
      <a href={href} target="_blank" rel="noreferrer" className="mono text-xs text-text/90 underline-offset-2 hover:text-primary hover:underline" title={value}>
        {truncateHex(value, lead, tail)}
      </a>
      <Copy value={value} />
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:underline">
      {children}<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
    </a>
  );
}

type BTone = "info" | "warn" | "danger" | "ok";
const TONE: Record<BTone, { c: string; i: typeof faCircleInfo; ic: string }> = {
  info: { c: "border-primary/40 bg-primary/5", i: faCircleInfo, ic: "text-primary" },
  warn: { c: "border-warning/40 bg-warning/5", i: faTriangleExclamation, ic: "text-warning" },
  danger: { c: "border-danger/40 bg-danger/5", i: faCircleExclamation, ic: "text-danger" },
  ok: { c: "border-primary/40 bg-primary/5", i: faCircleCheck, ic: "text-primary" },
};
export function Banner({ tone = "info", title, children, action }: { tone?: BTone; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-3 rounded border p-3 text-sm ${t.c}`}>
      <FontAwesomeIcon icon={t.i} className={`mt-0.5 h-4 w-4 ${t.ic}`} />
      <div className="flex-1">{title && <div className="font-semibold text-text">{title}</div>}{children && <div className="text-muted">{children}</div>}</div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: typeof faInbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-line bg-terminal/40 px-6 py-10 text-center">
      <FontAwesomeIcon icon={icon ?? faInbox} className="h-6 w-6 text-muted/60" />
      <div className="text-sm font-semibold text-text">{title}</div>
      {hint && <div className="max-w-sm text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** Terminal boot-line loading skeleton (not grey rectangles). */
export function TerminalBoot({ lines = 5 }: { lines?: number }) {
  const msgs = ["init source-pulse monitor", "connecting studionet rpc", "loading watch indexes", "reading audit stream", "syncing snapshots", "rendering timeline", "ready"];
  return (
    <div className="space-y-1 p-1 font-mono text-xs">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 text-muted">
          <span className="text-primary">$</span>
          <span>{msgs[i % msgs.length]}</span>
          <span className="h-2 w-2 bg-primary animate-ticker" style={{ animationDelay: `${i * 0.12}s` }} />
        </div>
      ))}
      <div className="flex items-center gap-2 text-primary"><span>$</span><span className="inline-block h-3.5 w-2 bg-primary animate-blink" /></div>
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "primary" | "cyan" | "warning" | "danger" }) {
  const c = tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : tone === "cyan" ? "text-cyan" : tone === "primary" ? "text-primary" : "text-text";
  return (
    <div className="terminal p-2.5">
      <div className="label">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}
