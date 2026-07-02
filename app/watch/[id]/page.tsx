"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faMagnifyingGlassChart, faTowerBroadcast, faGavel, faScaleBalanced, faPlay,
  faFlagCheckered, faBoxArchive, faRotateRight, faSatelliteDish, faClockRotateLeft, faLink,
} from "@fortawesome/free-solid-svg-icons";
import { CommandLog } from "@/components/CommandLog";
import { ChangeTimeline } from "@/components/Charts";
import { StatusChip, SeverityBadge, VerdictBadge, Banner, Empty, TerminalBoot, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getWatchlist, getWatchlistSnapshots, getWatchlistAlerts, getAuditTrail, hasContract } from "@/lib/sourcepulse";
import { hostOf, isHttpUrl } from "@/lib/format";
import type { Snapshot } from "@/lib/types";

type Tab = "timeline" | "snapshots" | "alerts" | "log";

export default function WatchlistDetailPage() {
  const id = String(useParams().id);
  const [tab, setTab] = useState<Tab>("timeline");
  const { run, busy, address } = useTx();

  const watch = useLoader(() => getWatchlist(id), [id]);
  const snaps = useLoader(() => getWatchlistSnapshots(id), [id]);
  const alerts = useLoader(() => getWatchlistAlerts(id), [id]);
  const audit = useLoader(() => getAuditTrail(id), [id]);

  const reloadAll = () => { watch.reload(); snaps.reload(); alerts.reload(); audit.reload(); };
  const w = watch.data;
  const isOwner = !!address && !!w && w.owner.toLowerCase() === address.toLowerCase();

  if (!hasContract()) return <div className="p-4 lg:p-6"><Banner tone="warn" title="no contract configured">Set the contract address to view this watchlist.</Banner></div>;

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <Link href="/" className="cmd inline-flex items-center gap-2 text-muted hover:text-text"><FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> :monitor</Link>

      {watch.loading && !w ? <TerminalBoot /> :
        watch.error ? <Banner tone="danger" title="failed to load watchlist" action={<button className="btn btn-ghost btn-xs" onClick={watch.reload}>Retry</button>}>{watch.error}</Banner> :
        !w ? <Empty title={`watchlist #${id} not found`} hint="It may not exist on this contract." /> :
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faSatelliteDish} className="text-primary" /> watch #{w.watchId} | {w.sourceType}</div>
              <h1 className="mt-1 font-mono text-xl font-semibold tracking-tight">{w.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>owner <Hex value={w.owner} /></span>
                <span>alert threshold <span className="mono text-text">{w.alertThreshold}</span></span>
                <span>snapshots <span className="mono text-text">{w.snapshotIds.length}/{w.maxSnapshots}</span></span>
              </div>
            </div>
            <StatusChip status={w.status} kind="watch" />
          </div>

          <div className="flex flex-wrap gap-3 text-xs">{w.sourceUrls.map((u) => <ExtLink key={u} href={u}><FontAwesomeIcon icon={faLink} className="h-2.5 w-2.5" /> {hostOf(u)}</ExtLink>)}</div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="terminal p-3"><div className="label">watch rules</div><ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted">{w.watchRules.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
            <div className="terminal p-3"><div className="label">risk rubric</div><ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted">{w.riskRubric.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
          </div>

          {isOwner && (
            <div className="terminal flex flex-wrap items-center gap-2 p-3">
              <span className="label mr-1">owner controls</span>
              {w.status === "draft" && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("activate watchlist", "activate_watchlist", [w.watchId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faPlay} className="h-3 w-3" /> activate</button>}
              {!["draft", "resolved", "archived"].includes(w.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("resolve watchlist", "resolve_watchlist", [w.watchId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faFlagCheckered} className="h-3 w-3" /> resolve</button>}
              {w.status === "resolved" && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("archive watchlist", "archive_watchlist", [w.watchId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faBoxArchive} className="h-3 w-3" /> archive</button>}
            </div>
          )}

          <div className="flex items-center justify-between border-b border-line">
            <div className="flex gap-1">
              {([["timeline", faMagnifyingGlassChart, 0], ["snapshots", faSatelliteDish, snaps.data?.length ?? 0], ["alerts", faTowerBroadcast, alerts.data?.length ?? 0], ["log", faClockRotateLeft, audit.data?.length ?? 0]] as const).map(([t, icon, n]) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"}`}>
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> {t}{t !== "timeline" ? <span className="mono text-xs opacity-70">{n}</span> : null}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> refresh</button>
          </div>

          {tab === "timeline" && <div className="terminal p-3">{snaps.loading && !snaps.data ? <TerminalBoot /> : <ChangeTimeline snapshots={snaps.data ?? []} height={320} />}</div>}
          {tab === "snapshots" && <SnapshotsTab watchId={id} snaps={snaps.data} loading={snaps.loading} error={snaps.error} reload={snaps.reload} onAction={reloadAll} run={run} busy={busy} threshold={w.alertThreshold} />}
          {tab === "alerts" && (
            alerts.loading && !alerts.data ? <TerminalBoot lines={3} /> :
            (alerts.data?.length ?? 0) === 0 ? <Empty icon={faTowerBroadcast} title="no alerts" /> :
            <div className="grid gap-2 sm:grid-cols-2">{alerts.data!.map((a) => (
              <div key={a.alertId} className="terminal space-y-2 p-3">
                <div className="flex items-center justify-between"><span className="cmd">alert#{a.alertId}</span><SeverityBadge severity={a.severity} /></div>
                <p className="text-sm text-muted">{a.summary}</p>
                {a.recommendedActions.length > 0 && <ul className="list-disc pl-4 text-xs text-muted">{a.recommendedActions.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}</ul>}
                <div className="text-xs text-muted">by <Hex value={a.publisher} /> | <StatusChip status={a.status} kind="alert" /></div>
              </div>
            ))}</div>
          )}
          {tab === "log" && (audit.loading && !audit.data ? <TerminalBoot /> : <CommandLog records={audit.data ?? []} height={420} />)}
        </>}
    </div>
  );
}

function SnapshotsTab({
  watchId, snaps, loading, error, reload, onAction, run, busy, threshold,
}: {
  watchId: string; snaps?: Snapshot[]; loading: boolean; error: string | null; reload: () => void;
  onAction: () => void; run: ReturnType<typeof useTx>["run"]; busy: boolean; threshold: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"challenge" | "appeal" | null>(null);
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  if (loading && !snaps) return <TerminalBoot />;
  if (error) return <Banner tone="danger" title="failed to load snapshots" action={<button className="btn btn-ghost btn-xs" onClick={reload}>Retry</button>}>{error}</Banner>;
  if (!snaps || snaps.length === 0) return <Empty icon={faSatelliteDish} title="no snapshots" hint="Submit a snapshot from the workbench." />;

  const canAlert = (s: Snapshot) => ["routine", "important", "risky", "suspicious", "finalized"].includes(s.status) && (s.verdict === "risky" || s.verdict === "suspicious" || s.riskScore >= threshold);
  const start = (sid: string, m: "challenge" | "appeal") => { setOpenId(sid); setMode(m); setReason(""); setUrls([]); };
  const submit = async (s: Snapshot) => {
    const fn = mode === "challenge" ? "challenge_snapshot" : "file_appeal";
    const h = await run(mode === "challenge" ? "challenge snapshot" : "file appeal", fn, [watchId, s.snapshotId, reason.trim(), urls]);
    if (h) { setOpenId(null); setMode(null); onAction(); }
  };

  return (
    <div className="space-y-3">
      {snaps.map((s) => (
        <div key={s.snapshotId} className="terminal p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><span className="cmd">snap#{s.snapshotId}</span><StatusChip status={s.status} kind="snapshot" /><VerdictBadge verdict={s.verdict} change={s.changeScore} risk={s.riskScore} /></div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{s.snapshotSummary}</p>
              <div className="mt-1 text-xs text-muted">submitter <Hex value={s.submitter} /> | <ExtLink href={s.sourceUrl}>{hostOf(s.sourceUrl)}</ExtLink></div>
            </div>
          </div>
          {s.changeSummary && <p className="mt-2 text-xs text-muted">{s.changeSummary}</p>}
          {s.importantChanges.length > 0 && <div className="mt-1"><div className="label text-cyan">important changes</div><ul className="mt-1 list-disc pl-4 text-xs text-muted">{s.importantChanges.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            {["submitted", "compared"].includes(s.status) && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("assess snapshot", "assess_snapshot", [watchId, s.snapshotId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> assess</button>}
            {canAlert(s) && <button className="btn btn-cyan btn-xs" disabled={busy} onClick={() => run("publish alert", "publish_alert", [watchId, s.snapshotId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faTowerBroadcast} className="h-3 w-3" /> publish alert</button>}
            {["routine", "important", "risky", "suspicious", "finalized", "compared"].includes(s.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(s.snapshotId, "challenge")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> challenge</button>}
            {["routine", "important", "risky", "suspicious", "challenged", "compared"].includes(s.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(s.snapshotId, "appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> appeal</button>}
          </div>

          {openId === s.snapshotId && mode && (
            <div className="mt-3 space-y-3 rounded border border-line bg-bg p-3">
              <div className="cmd font-semibold capitalize">{mode} snap#{s.snapshotId}</div>
              <label className="block"><span className="label">reason</span><textarea className="field mt-1.5 min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
              <ListInput label="evidence URLs" items={urls} onChange={setUrls} placeholder="https://source.example" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
              <div className="flex justify-end gap-2"><button className="btn btn-ghost btn-xs" onClick={() => { setOpenId(null); setMode(null); }}>cancel</button><button className="btn btn-primary btn-xs" disabled={busy || !reason.trim()} onClick={() => submit(s)}>{busy ? "submitting…" : `submit ${mode}`}</button></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
