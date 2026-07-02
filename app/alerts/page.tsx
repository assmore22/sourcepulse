"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTowerBroadcast, faRotateRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SeverityBadge, StatusChip, Banner, Empty, TerminalBoot, Hex } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getRecentWatchlists, getWatchlistAlerts, hasContract } from "@/lib/sourcepulse";
import type { Alert, Watchlist } from "@/lib/types";

interface FeedAlert extends Alert { watchTitle: string }

async function loadFeed(): Promise<FeedAlert[]> {
  const watches: Watchlist[] = await getRecentWatchlists(60);
  const withAlerts = watches.filter((w) => (w.alertIds?.length ?? 0) > 0);
  const groups = await Promise.all(withAlerts.map(async (w) => {
    const a = await getWatchlistAlerts(w.watchId);
    return a.map((al) => ({ ...al, watchTitle: w.title }));
  }));
  return groups.flat().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

const SEVS = ["all", "critical", "high", "medium", "low"] as const;

export default function AlertsPage() {
  const feed = useLoader(loadFeed, []);
  const [sev, setSev] = useState<(typeof SEVS)[number]>("all");

  if (!hasContract()) return <div className="p-4 lg:p-6"><Banner tone="warn" title="no contract configured">Set the contract address to view alerts.</Banner></div>;

  const items = (feed.data ?? []).filter((a) => sev === "all" || a.severity === sev);

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faTowerBroadcast} /> :alerts</div>
          <h1 className="mt-1 font-mono text-xl font-semibold tracking-tight">Published alerts</h1>
        </div>
        <button type="button" className="btn btn-ghost btn-xs" onClick={feed.reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${feed.loading ? "animate-spin" : ""}`} /> refresh</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SEVS.map((s) => (
          <button key={s} type="button" onClick={() => setSev(s)} className={`btn btn-xs capitalize ${sev === s ? "btn-primary" : "btn-ghost"}`}>
            {s}{s !== "all" && feed.data ? <span className="mono opacity-70"> {feed.data.filter((a) => a.severity === s).length}</span> : null}
          </button>
        ))}
      </div>

      {feed.loading && !feed.data ? <TerminalBoot lines={4} /> :
        feed.error ? <Banner tone="danger" title="failed to load alerts" action={<button className="btn btn-ghost btn-xs" onClick={feed.reload}>Retry</button>}>{feed.error}</Banner> :
        items.length === 0 ? <Empty icon={faTowerBroadcast} title={sev === "all" ? "no alerts published yet" : `no ${sev} alerts`} hint="Alerts appear when an assessed snapshot meets the threshold." /> :
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <div key={`${a.watchId}-${a.alertId}`} className="terminal flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between"><span className="cmd">alert#{a.alertId}</span><SeverityBadge severity={a.severity} /></div>
              <div className="text-xs text-muted">on <span className="text-text">{a.watchTitle}</span></div>
              <p className="text-sm text-muted">{a.summary}</p>
              {a.recommendedActions.length > 0 && <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted">{a.recommendedActions.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}</ul>}
              <div className="mt-auto flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
                <span>by <Hex value={a.publisher} /></span>
                <div className="flex items-center gap-2"><StatusChip status={a.status} kind="alert" /><Link href={`/watch/${a.watchId}`} className="text-cyan hover:underline">watch #{a.watchId} <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></Link></div>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
