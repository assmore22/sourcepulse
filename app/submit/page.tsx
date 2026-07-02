"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faCircleCheck, faArrowRight, faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, TerminalBoot, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getActiveWatchlists, hasContract } from "@/lib/sourcepulse";
import { isHttpUrl, hostOf } from "@/lib/format";

export default function SubmitSnapshotPage() {
  const { run, busy, connected, wrongNetwork } = useTx();
  const watches = useLoader(() => getActiveWatchlists(60), []);
  const [wid, setWid] = useState("");
  const [src, setSrc] = useState("");
  const [summary, setSummary] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const list = watches.data ?? [];
  const selected = list.find((w) => w.watchId === wid);
  useEffect(() => { if (selected && !src) setSrc(selected.sourceUrls[0] ?? ""); }, [selected, src]);
  const valid = !!selected && isHttpUrl(src) && urls.length > 0;

  const submit = async () => {
    if (!selected) return;
    const h = await run("submit snapshot", "submit_snapshot", [selected.watchId, src.trim(), summary.trim(), urls]);
    if (h) { setDone(selected.watchId); setSummary(""); setUrls([]); watches.reload(); }
  };

  if (!hasContract()) return <div className="p-4 lg:p-6"><Banner tone="warn" title="no contract configured">Set the contract address to submit snapshots.</Banner></div>;

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faFileArrowUp} /> :submit-snapshot</div>
        <h1 className="mt-1 font-mono text-xl font-semibold tracking-tight">Submit a source snapshot</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Capture a source state for an active watchlist. The AI monitor reads the source live and judges the change.</p>
      </div>

      {!connected && <Banner tone="warn" title="connect a wallet">Connect your wallet to submit.</Banner>}
      {connected && wrongNetwork && <Banner tone="warn" title="wrong network">Switch to GenLayer Studionet - we’ll prompt on submit.</Banner>}
      {done && <Banner tone="ok" title="snapshot submitted" action={<Link className="btn btn-ghost btn-xs" href={`/watch/${done}`}>open watch <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>}>Awaiting AI assessment on watch #{done}.</Banner>}

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,340px)]">
        <div className="terminal space-y-4 p-4">
          <div>
            <span className="label">target watchlist</span>
            {watches.loading && !watches.data ? <div className="mt-1.5"><TerminalBoot lines={3} /></div> :
              watches.error ? <div className="mt-1.5"><Banner tone="danger" title="failed to load" action={<button className="btn btn-ghost btn-xs" onClick={watches.reload}>Retry</button>}>{watches.error}</Banner></div> :
              list.length === 0 ? <div className="mt-1.5"><Empty title="no active watchlists" hint="Create + activate a watchlist first." /></div> :
              <select className="field mt-1.5 cmd" value={wid} onChange={(e) => setWid(e.target.value)}>
                <option value="">select…</option>
                {list.map((w) => <option key={w.watchId} value={w.watchId}>#{w.watchId} - {w.title}</option>)}
              </select>}
          </div>
          <label className="block"><span className="label">source URL</span><input className="field mt-1.5 mono" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://docs.example/page" /></label>
          <label className="block"><span className="label">snapshot summary</span><textarea className="field mt-1.5 min-h-[110px]" value={summary} maxLength={2000} onChange={(e) => setSummary(e.target.value)} placeholder="What changed at this source…" /><span className="mt-1 block text-right text-[11px] text-muted">{summary.length}/2000</span></label>
          <ListInput label="evidence URLs (required, max 6)" items={urls} onChange={setUrls} placeholder="https://docs.example/page" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be http(s).")} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{valid ? <span className="inline-flex items-center gap-1 text-primary"><FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> ready</span> : "Select a watchlist, set source URL + evidence."}</span>
            <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "submitting…" : "submit snapshot"}</button>
          </div>
        </div>
        <div className="space-y-3">
          {selected ? (
            <div className="terminal space-y-2 p-4">
              <div className="flex items-center justify-between"><div className="cmd">{selected.title}</div><StatusChip status={selected.status} kind="watch" /></div>
              <div className="text-xs text-muted">{selected.sourceType} · alert threshold {selected.alertThreshold}</div>
              <div className="label mt-1">source URLs</div>
              <div className="flex flex-wrap gap-2 text-xs">{selected.sourceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>
            </div>
          ) : (
            <div className="terminal"><Empty icon={faSatelliteDish} title="pick a watchlist" hint="Select a watchlist to see its sources." /></div>
          )}
        </div>
      </div>
    </div>
  );
}
