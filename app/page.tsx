"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faFileArrowUp, faMagnifyingGlassChart, faTowerBroadcast, faGavel, faScaleBalanced,
  faRotateRight, faXmark, faArrowRight, faTerminal, faBell, faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { CommandLog } from "@/components/CommandLog";
import { ChangeTimeline } from "@/components/Charts";
import { StatusChip, SeverityBadge, VerdictBadge, Banner, Empty, TerminalBoot, Stat, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import {
  getPublicStats, getRecentWatchlists, getWatchlistSnapshots, getWatchlistAlerts, getAuditTrail, hasContract,
} from "@/lib/sourcepulse";
import { isHttpUrl, hostOf } from "@/lib/format";
import type { Watchlist, Snapshot } from "@/lib/types";

type Mode = null | "create" | "submit" | "assess" | "alert" | "challenge" | "appeal";

export default function WorkbenchPage() {
  const [selWatch, setSelWatch] = useState<string | null>(null);
  const [selSnap, setSelSnap] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);

  const stats = useLoader(() => getPublicStats(), []);
  const watches = useLoader<Watchlist[]>(() => getRecentWatchlists(40), []);
  const list = watches.data ?? [];
  const watch = useMemo(() => list.find((w) => w.watchId === selWatch) ?? list[0], [list, selWatch]);
  const wid = watch?.watchId;

  const snaps = useLoader(() => (wid ? getWatchlistSnapshots(wid) : Promise.resolve([])), [wid]);
  const alerts = useLoader(() => (wid ? getWatchlistAlerts(wid) : Promise.resolve([])), [wid]);
  const audit = useLoader(() => (wid ? getAuditTrail(wid) : Promise.resolve([])), [wid]);
  const snapshot = (snaps.data ?? []).find((s) => s.snapshotId === selSnap);

  const reloadAll = () => { stats.reload(); watches.reload(); snaps.reload(); alerts.reload(); audit.reload(); };

  if (!hasContract()) {
    return <div className="p-4 lg:p-6"><Banner tone="warn" title="no contract configured">Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> in <span className="mono">.env.local</span> to boot the monitor.</Banner></div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-92px)] flex-col">
      {/* watch selector + stats strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <span className="cmd text-muted">watch:</span>
        {watches.loading && !watches.data ? <span className="cmd text-muted">loading…</span> :
          list.length === 0 ? <span className="cmd text-muted">none - run :new</span> :
          <select className="field !w-auto !py-1 cmd" value={watch?.watchId ?? ""} onChange={(e) => { setSelWatch(e.target.value); setSelSnap(null); }}>
            {list.map((w) => <option key={w.watchId} value={w.watchId}>#{w.watchId} {w.title}</option>)}
          </select>}
        {watch && <StatusChip status={watch.status} kind="watch" />}
        <div className="ml-auto flex items-center gap-2">
          <span className="cmd text-muted">watches {stats.data?.watchlists ?? 0} | snaps {stats.data?.snapshots ?? 0} | alerts {stats.data?.publishedAlerts ?? 0} | alerting {stats.data?.alertingWatchlists ?? 0}</span>
          <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${snaps.loading ? "animate-spin" : ""}`} /></button>
        </div>
      </div>

      {/* 3-column terminal grid */}
      <div className="grid flex-1 grid-cols-1 gap-px overflow-hidden bg-line lg:grid-cols-[30%_45%_25%]">
        {/* left: command log */}
        <section className="flex flex-col overflow-hidden bg-bg p-3">
          <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faTerminal} className="text-primary" /> command log{watch ? ` | #${watch.watchId}` : ""}</div>
          {audit.loading && !audit.data ? <TerminalBoot lines={6} /> : <CommandLog records={audit.data ?? []} height={9999} />}
        </section>

        {/* center: timeline */}
        <section className="flex flex-col overflow-y-auto bg-bg p-3">
          <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faMagnifyingGlassChart} className="text-cyan" /> source-change timeline</div>
          <div className="terminal p-2">
            {snaps.loading && !snaps.data ? <TerminalBoot lines={5} /> : <ChangeTimeline snapshots={snaps.data ?? []} height={280} />}
          </div>
          {/* snapshot row */}
          <div className="mt-3 space-y-1.5">
            {(snaps.data ?? []).map((s) => (
              <button key={s.snapshotId} type="button" onClick={() => setSelSnap(s.snapshotId)}
                className={`flex w-full items-center gap-2 rounded border px-2.5 py-1.5 text-left text-xs transition-colors ${selSnap === s.snapshotId ? "border-primary/50 bg-primary/10" : "border-line bg-terminal hover:border-primary/30"}`}>
                <span className="mono text-muted">snap#{s.snapshotId}</span>
                <span className="flex-1 truncate text-text/80">{s.snapshotSummary || s.sourceUrl}</span>
                <VerdictBadge verdict={s.verdict} change={s.changeScore} risk={s.riskScore} />
              </button>
            ))}
            {(snaps.data?.length ?? 0) === 0 && !snaps.loading && <div className="cmd text-muted">no snapshots - run :submit</div>}
          </div>
        </section>

        {/* right: alert drawer + snapshot inspector */}
        <section className="flex flex-col gap-3 overflow-y-auto bg-bg p-3">
          <div>
            <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faBell} className="text-warning" /> alert drawer</div>
            {alerts.loading && !alerts.data ? <TerminalBoot lines={3} /> :
              (alerts.data?.length ?? 0) === 0 ? <Empty icon={faTowerBroadcast} title="no alerts" hint="Publish an alert from an assessed snapshot." /> :
              <div className="space-y-2">{alerts.data!.map((a) => (
                <div key={a.alertId} className="terminal p-2.5">
                  <div className="flex items-center justify-between"><span className="cmd text-text">alert#{a.alertId}</span><SeverityBadge severity={a.severity} /></div>
                  <p className="mt-1 text-xs text-muted">{a.summary}</p>
                </div>
              ))}</div>}
          </div>
          <div>
            <div className="mb-2 label">snapshot inspector</div>
            {!snapshot ? <Empty title="no snapshot selected" hint="Pick a snapshot from the timeline." /> :
              <div className="terminal space-y-2 p-3">
                <div className="flex items-center gap-2"><span className="cmd text-text">snap#{snapshot.snapshotId}</span><StatusChip status={snapshot.status} kind="snapshot" /></div>
                <VerdictBadge verdict={snapshot.verdict} change={snapshot.changeScore} risk={snapshot.riskScore} />
                <div className="text-xs text-muted">submitter <Hex value={snapshot.submitter} /></div>
                <ExtLink href={snapshot.sourceUrl}>{hostOf(snapshot.sourceUrl)}</ExtLink>
                {snapshot.changeSummary && <p className="text-xs text-muted">{snapshot.changeSummary}</p>}
                {snapshot.riskFlags.length > 0 && <div><div className="label text-danger">risk flags</div><ul className="mt-1 list-disc pl-4 text-xs text-muted">{snapshot.riskFlags.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
                {watch && <Link href={`/watch/${watch.watchId}`} className="btn btn-ghost btn-xs w-full justify-center">open watch <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" /></Link>}
              </div>}
          </div>
        </section>
      </div>

      {/* bottom action bar */}
      <div className="sticky bottom-0 z-20 flex items-center gap-2 overflow-x-auto border-t border-line bg-terminal px-3 py-2">
        <button type="button" className="btn btn-primary btn-xs shrink-0" onClick={() => setMode("create")}><FontAwesomeIcon icon={faPlus} className="h-3 w-3" /> New Watchlist</button>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("submit")}><FontAwesomeIcon icon={faFileArrowUp} className="h-3 w-3" /> Submit Snapshot</button>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("assess")}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Assess Snapshot</button>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("alert")}><FontAwesomeIcon icon={faTowerBroadcast} className="h-3 w-3" /> Publish Alert</button>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("challenge")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Challenge</button>
        <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => setMode("appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>
      </div>

      <CommandPanel mode={mode} onClose={() => setMode(null)} watch={watch} snaps={snaps.data ?? []} onDone={() => { setMode(null); reloadAll(); }} />
    </div>
  );
}

/* ── modal command panels ── */
function CommandPanel({ mode, onClose, watch, snaps, onDone }: { mode: Mode; onClose: () => void; watch?: Watchlist; snaps: Snapshot[]; onDone: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { run, busy, connected, wrongNetwork } = useTx();

  useEffect(() => {
    if (mode) setMounted(true);
    else if (mounted) {
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      if (panel.current) tl.to(panel.current, { y: 16, opacity: 0, duration: 0.18, ease: "power2.in" }, 0);
      if (overlay.current) tl.to(overlay.current, { opacity: 0, duration: 0.18 }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  useEffect(() => {
    if (mounted && mode) {
      if (overlay.current) gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
      if (panel.current) gsap.fromTo(panel.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" });
    }
  }, [mounted, mode]);

  if (!mounted || !mode) return null;
  const title = { create: ":new-watchlist", submit: ":submit-snapshot", assess: ":assess-snapshot", alert: ":publish-alert", challenge: ":challenge", appeal: ":appeal" }[mode];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div ref={overlay} className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={panel} className="terminal relative z-10 flex max-h-[88vh] w-[min(96vw,580px)] flex-col overflow-hidden shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="cmd font-semibold text-primary">{title}</h2>
          <button type="button" className="text-muted hover:text-text" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!connected && <Banner tone="warn" title="connect a wallet">Use connect to sign the transaction.</Banner>}
          {connected && wrongNetwork && <Banner tone="warn" title="wrong network">Switch to GenLayer Studionet; we’ll prompt on submit.</Banner>}
          {mode === "create" && <CreateForm run={run} busy={busy} onDone={onDone} />}
          {mode !== "create" && !watch && <Banner tone="info" title="no watchlist selected">Pick a watchlist in the workbench first.</Banner>}
          {mode === "submit" && watch && <SubmitForm run={run} busy={busy} watch={watch} onDone={onDone} />}
          {mode === "assess" && watch && <PickSnapForm run={run} busy={busy} watch={watch} snaps={snaps.filter((s) => ["submitted", "compared"].includes(s.status))} label="Assess Snapshot" fn="assess_snapshot" onDone={onDone} />}
          {mode === "alert" && watch && <PickSnapForm run={run} busy={busy} watch={watch} snaps={snaps.filter((s) => ["routine", "important", "risky", "suspicious", "finalized"].includes(s.status))} label="Publish Alert" fn="publish_alert" onDone={onDone} />}
          {mode === "challenge" && watch && <DisputeForm run={run} busy={busy} watch={watch} snaps={snaps} label="Challenge" fn="challenge_snapshot" onDone={onDone} />}
          {mode === "appeal" && watch && <DisputeForm run={run} busy={busy} watch={watch} snaps={snaps} label="File appeal" fn="file_appeal" onDone={onDone} />}
        </div>
      </div>
    </div>
  );
}

function CreateForm({ run, busy, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [stype, setStype] = useState("Developer Documentation / Repository");
  const [src, setSrc] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [rubric, setRubric] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(70);
  const [maxSnaps, setMaxSnaps] = useState(50);
  const valid = title.trim() && stype.trim() && rules.length > 0 && rubric.length > 0;
  return (
    <div className="space-y-3">
      <label className="block"><span className="label">title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GenLayer docs and SDK source change monitor" /></label>
      <label className="block"><span className="label">source type</span><input className="field mt-1.5" value={stype} onChange={(e) => setStype(e.target.value)} /></label>
      <ListInput label="source URLs" items={src} onChange={setSrc} placeholder="https://docs.example" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <ListInput label="watch rules (required)" items={rules} onChange={setRules} placeholder="flag important SDK changes" max={12} />
      <ListInput label="risk rubric (required)" items={rubric} onChange={setRubric} placeholder="integration breakage risk" max={12} />
      <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">alert threshold</span><input type="number" min={0} max={100} className="field mt-1.5 mono" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></label><label className="block"><span className="label">max snapshots</span><input type="number" min={1} max={200} className="field mt-1.5 mono" value={maxSnaps} onChange={(e) => setMaxSnaps(Number(e.target.value))} /></label></div>
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run("create watchlist", "create_watchlist", [title.trim(), stype.trim(), src, rules, rubric, threshold, maxSnaps]); if (h) onDone(); }}>{busy ? "submitting…" : "create watchlist"}</button>
    </div>
  );
}

function SubmitForm({ run, busy, watch, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; watch: Watchlist; onDone: () => void }) {
  const [src, setSrc] = useState(watch.sourceUrls[0] ?? "");
  const [summary, setSummary] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const valid = isHttpUrl(src) && urls.length > 0;
  return (
    <div className="space-y-3">
      <div className="cmd text-xs text-muted">target: #{watch.watchId} {watch.title}</div>
      <label className="block"><span className="label">source URL</span><input className="field mt-1.5 mono" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://docs.example/page" /></label>
      <label className="block"><span className="label">snapshot summary</span><textarea className="field mt-1.5 min-h-[80px]" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What changed at this source…" /></label>
      <ListInput label="evidence URLs (required)" items={urls} onChange={setUrls} placeholder="https://docs.example/page" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run("submit snapshot", "submit_snapshot", [watch.watchId, src.trim(), summary.trim(), urls]); if (h) onDone(); }}>{busy ? "submitting…" : "submit snapshot"}</button>
    </div>
  );
}

function PickSnapForm({ run, busy, watch, snaps, label, fn, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; watch: Watchlist; snaps: Snapshot[]; label: string; fn: string; onDone: () => void }) {
  const [sid, setSid] = useState("");
  return (
    <div className="space-y-3">
      <div className="cmd text-xs text-muted">target: #{watch.watchId} {watch.title}</div>
      {snaps.length === 0 ? <Empty title="no eligible snapshots" hint={fn === "assess_snapshot" ? "Submit a snapshot first." : "Assess a snapshot that meets the alert threshold first."} /> :
        <>
          <label className="block"><span className="label">snapshot</span>
            <select className="field mt-1.5 cmd" value={sid} onChange={(e) => setSid(e.target.value)}>
              <option value="">select…</option>
              {snaps.map((s) => <option key={s.snapshotId} value={s.snapshotId}>snap#{s.snapshotId} - {s.verdict || s.status} {s.riskScore ? `(r${s.riskScore})` : ""}</option>)}
            </select>
          </label>
          <button className="btn btn-primary w-full justify-center" disabled={!sid || busy} onClick={async () => { const h = await run(label, fn, [watch.watchId, sid]); if (h) onDone(); }}>{busy ? "submitting…" : label}</button>
        </>}
    </div>
  );
}

function DisputeForm({ run, busy, watch, snaps, label, fn, onDone }: { run: ReturnType<typeof useTx>["run"]; busy: boolean; watch: Watchlist; snaps: Snapshot[]; label: string; fn: string; onDone: () => void }) {
  const [sid, setSid] = useState("");
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const valid = sid && reason.trim();
  return (
    <div className="space-y-3">
      <div className="cmd text-xs text-muted">target: #{watch.watchId} {watch.title}</div>
      <label className="block"><span className="label">snapshot</span>
        <select className="field mt-1.5 cmd" value={sid} onChange={(e) => setSid(e.target.value)}>
          <option value="">select…</option>
          {snaps.map((s) => <option key={s.snapshotId} value={s.snapshotId}>snap#{s.snapshotId} - {s.verdict || s.status}</option>)}
        </select>
      </label>
      <label className="block"><span className="label">reason</span><textarea className="field mt-1.5 min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={fn === "challenge_snapshot" ? "Why is this assessment wrong?" : "Why should this be reconsidered?"} /></label>
      <ListInput label="evidence URLs" items={urls} onChange={setUrls} placeholder="https://source.example" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
      <button className="btn btn-primary w-full justify-center" disabled={!valid || busy} onClick={async () => { const h = await run(label, fn, [watch.watchId, sid, reason.trim(), urls]); if (h) onDone(); }}>{busy ? "submitting…" : label}</button>
    </div>
  );
}
