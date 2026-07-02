"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret, faMagnifyingGlass, faSatelliteDish, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ReputationChart } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, TerminalBoot, Hex, Stat } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getProfile, getSubmitterSnapshots, getOwnerWatchlists, hasContract } from "@/lib/sourcepulse";

function repTier(score: number): { label: string; tone: "danger" | "warning" | "primary" | "cyan" } {
  if (score < 80) return { label: "probation", tone: "danger" };
  if (score < 120) return { label: "standard", tone: "warning" };
  if (score < 300) return { label: "trusted", tone: "primary" };
  return { label: "core", tone: "cyan" };
}

export default function ProfilePage() {
  const { address } = useAccount();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  useEffect(() => { if (address && !target) { setTarget(address); setQuery(address); } }, [address, target]);

  const profile = useLoader(() => (target ? getProfile(target) : Promise.resolve(null)), [target]);
  const mySnaps = useLoader(() => (target ? getSubmitterSnapshots(target) : Promise.resolve([])), [target]);
  const myWatches = useLoader(() => (target ? getOwnerWatchlists(target) : Promise.resolve([])), [target]);

  if (!hasContract()) return <div className="p-4 lg:p-6"><Banner tone="warn" title="no contract configured">Set the contract address to view profiles.</Banner></div>;

  const isValid = /^0x[0-9a-fA-F]{40}$/.test(query.trim());
  const p = profile.data;
  const tier = p ? repTier(p.reputationScore) : null;
  const toneClass = (t: string) => t === "danger" ? "text-danger" : t === "warning" ? "text-warning" : t === "cyan" ? "text-cyan" : "text-primary";
  const chipClass = (t: string) => t === "danger" ? "border-danger/50 text-danger bg-danger/10" : t === "warning" ? "border-warning/50 text-warning bg-warning/10" : t === "cyan" ? "border-cyan/50 text-cyan bg-cyan/10" : "border-primary/50 text-primary bg-primary/10";

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faUserSecret} /> :profile</div>
        <h1 className="mt-1 font-mono text-xl font-semibold tracking-tight">Reviewer profile</h1>
      </div>

      <div className="terminal flex flex-wrap items-end gap-2 p-3">
        <label className="min-w-[260px] flex-1"><span className="label">wallet address</span><input className="field mt-1.5 mono" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="0x…" /></label>
        <button type="button" className="btn btn-primary" disabled={!isValid} onClick={() => setTarget(query.trim())}><FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" /> look up</button>
        {address && <button type="button" className="btn btn-ghost" onClick={() => { setQuery(address); setTarget(address); }}>my profile</button>}
      </div>

      {!target ? <Empty icon={faUserSecret} title="enter an address" hint="Connect a wallet or paste an address to view its reputation." /> :
        profile.loading && !p ? <TerminalBoot /> :
        profile.error ? <Banner tone="danger" title="failed to load profile" action={<button className="btn btn-ghost btn-xs" onClick={profile.reload}>Retry</button>}>{profile.error}</Banner> :
        !p ? <Empty title="no profile" /> :
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="terminal space-y-3 p-4">
              <div className="text-xs text-muted">address</div>
              <Hex value={p.address} lead={10} tail={8} />
              <div className="flex items-end justify-between border-t border-line pt-3">
                <div><div className="label">reputation</div><div className={`font-mono text-3xl font-semibold tabular-nums ${toneClass(tier!.tone)}`}>{p.reputationScore}</div></div>
                <span className={`chip ${chipClass(tier!.tone)}`}>{tier!.label}</span>
              </div>
              <div className="text-[11px] text-muted">last activity tick {p.lastActivity}</div>
            </div>
            <div className="terminal p-4"><div className="label mb-2">activity breakdown</div><ReputationChart profile={p} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="watches" value={p.watchesCreated} tone="primary" />
            <Stat label="snapshots" value={p.snapshotsSubmitted} tone="cyan" />
            <Stat label="accepted" value={p.snapshotsAccepted} tone="primary" />
            <Stat label="alerts" value={p.alertsPublished} tone="warning" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faSatelliteDish} /> snapshots submitted</div>
              {mySnaps.loading && !mySnaps.data ? <TerminalBoot lines={3} /> :
                (mySnaps.data?.length ?? 0) === 0 ? <Empty title="no snapshots" /> :
                <div className="space-y-2">{mySnaps.data!.slice(0, 8).map((s) => (
                  <Link key={s.snapshotId} href={`/watch/${s.watchId}`} className="terminal flex items-center justify-between gap-2 p-3 hover:border-primary/40">
                    <span className="min-w-0"><span className="cmd">snap#{s.snapshotId}</span><span className="block truncate text-xs text-muted">{s.snapshotSummary}</span></span>
                    <span className="flex shrink-0 items-center gap-2"><VerdictBadge verdict={s.verdict} /><StatusChip status={s.status} kind="snapshot" /></span>
                  </Link>
                ))}</div>}
            </section>
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faSatelliteDish} /> watchlists created</div>
              {myWatches.loading && !myWatches.data ? <TerminalBoot lines={3} /> :
                (myWatches.data?.length ?? 0) === 0 ? <Empty title="no watchlists" /> :
                <div className="space-y-2">{myWatches.data!.slice(0, 8).map((w) => (
                  <Link key={w.watchId} href={`/watch/${w.watchId}`} className="terminal flex items-center justify-between gap-2 p-3 hover:border-primary/40">
                    <span className="min-w-0"><span className="cmd">{w.title}</span><span className="block truncate text-xs text-muted">{w.sourceType}</span></span>
                    <span className="flex shrink-0 items-center gap-2"><StatusChip status={w.status} kind="watch" /><FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-muted" /></span>
                  </Link>
                ))}</div>}
            </section>
          </div>
        </>}
    </div>
  );
}
