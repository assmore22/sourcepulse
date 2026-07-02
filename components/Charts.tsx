"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TONE_HEX, toneOf, type Snapshot, type Profile } from "@/lib/types";

/** D3 source-change timeline: change + risk scores across the snapshot sequence. */
export function ChangeTimeline({ snapshots, height = 300 }: { snapshots: Snapshot[]; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = [...snapshots].sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
    const W = 760, H = height, M = { top: 18, right: 16, bottom: 28, left: 34 };
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();

    // grid
    const y = d3.scaleLinear().domain([0, 100]).range([H - M.bottom, M.top]);
    [0, 25, 50, 75, 100].forEach((t) => {
      svg.append("line").attr("x1", M.left).attr("x2", W - M.right).attr("y1", y(t)).attr("y2", y(t)).attr("stroke", "#1F342A").attr("stroke-width", 1);
      svg.append("text").attr("x", 4).attr("y", y(t) + 3).attr("fill", "#7D938A").attr("font-size", 9).attr("font-family", "ui-monospace, monospace").text(t);
    });

    if (data.length === 0) {
      svg.append("text").attr("x", W / 2).attr("y", H / 2).attr("text-anchor", "middle").attr("fill", "#7D938A").attr("font-size", 12).attr("font-family", "ui-monospace, monospace").text("timeline empty - submit a snapshot");
      return;
    }

    const x = data.length === 1
      ? () => (M.left + W - M.right) / 2
      : d3.scaleLinear().domain([0, data.length - 1]).range([M.left + 10, W - M.right - 10]) as (i: number) => number;
    const xi = (i: number) => (data.length === 1 ? (M.left + W - M.right) / 2 : (x as any)(i));

    const mkLine = (key: "changeScore" | "riskScore", color: string, dash: string) => {
      const line = d3.line<Snapshot>().x((_d, i) => xi(i)).y((d) => y(d[key] || 0)).curve(d3.curveMonotoneX);
      svg.append("path").datum(data).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("stroke-dasharray", dash).attr("opacity", 0.9).attr("d", line as any);
    };
    if (data.length > 1) { mkLine("changeScore", "#22D3EE", ""); mkLine("riskScore", "#EF4444", "4 3"); }

    // nodes colored by verdict
    svg.append("g").selectAll("circle").data(data).join("circle")
      .attr("cx", (_d, i) => xi(i)).attr("cy", (d) => y(d.changeScore || 0)).attr("r", 5)
      .attr("fill", "#0B1117").attr("stroke", (d) => TONE_HEX[toneOf(d.verdict)]).attr("stroke-width", 2.5);
    svg.append("g").selectAll("text.sn").data(data).join("text")
      .attr("x", (_d, i) => xi(i)).attr("y", (d) => y(d.changeScore || 0) - 9).attr("text-anchor", "middle")
      .attr("fill", "#7D938A").attr("font-size", 9).attr("font-family", "ui-monospace, monospace").text((d) => `#${d.snapshotId}`);

    // legend
    svg.append("text").attr("x", M.left).attr("y", 12).attr("fill", "#22D3EE").attr("font-size", 9).attr("font-family", "ui-monospace, monospace").text("- change");
    svg.append("text").attr("x", M.left + 70).attr("y", 12).attr("fill", "#EF4444").attr("font-size", 9).attr("font-family", "ui-monospace, monospace").text("-- risk");
  }, [snapshots, height]);

  return <svg ref={ref} role="img" aria-label="Source change timeline" />;
}

/** D3 reputation bars for the reviewer profile. */
export function ReputationChart({ profile }: { profile: Profile }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = [
      { k: "Snapshots submitted", v: profile.snapshotsSubmitted, c: "#22D3EE" },
      { k: "Snapshots accepted", v: profile.snapshotsAccepted, c: "#4ADE80" },
      { k: "Alerts published", v: profile.alertsPublished, c: "#F59E0B" },
      { k: "Challenges won", v: profile.challengesWon, c: "#4ADE80" },
      { k: "Challenges lost", v: profile.challengesLost, c: "#EF4444" },
      { k: "Appeals won", v: profile.appealsWon, c: "#4ADE80" },
      { k: "Appeals lost", v: profile.appealsLost, c: "#EF4444" },
    ];
    const W = 480, rowH = 28, M = { top: 6, right: 32, bottom: 6, left: 138 };
    const H = M.top + M.bottom + data.length * rowH;
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();
    const max = Math.max(1, d3.max(data, (d) => d.v) ?? 1);
    const x = d3.scaleLinear().domain([0, max]).range([0, W - M.left - M.right]);
    const yb = d3.scaleBand<string>().domain(data.map((d) => d.k)).range([M.top, H - M.bottom]).padding(0.32);
    const g = svg.append("g").attr("transform", `translate(${M.left},0)`);
    g.selectAll("line.track").data(data).join("line")
      .attr("x1", 0).attr("x2", x(max)).attr("y1", (d) => (yb(d.k) ?? 0) + yb.bandwidth() / 2).attr("y2", (d) => (yb(d.k) ?? 0) + yb.bandwidth() / 2)
      .attr("stroke", "#1F342A").attr("stroke-width", 1);
    g.selectAll("rect.bar").data(data).join("rect")
      .attr("x", 0).attr("y", (d) => yb(d.k) ?? 0).attr("height", yb.bandwidth()).attr("rx", 2)
      .attr("fill", (d) => d.c).attr("opacity", 0.9)
      .attr("width", 0).transition().duration(500).attr("width", (d) => Math.max(d.v > 0 ? 4 : 0, x(d.v)));
    svg.append("g").selectAll("text.lbl").data(data).join("text")
      .attr("x", M.left - 10).attr("y", (d) => (yb(d.k) ?? 0) + yb.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .attr("fill", "#7D938A").attr("font-size", 11).text((d) => d.k);
    g.selectAll("text.val").data(data).join("text")
      .attr("x", (d) => x(d.v) + 6).attr("y", (d) => (yb(d.k) ?? 0) + yb.bandwidth() / 2 + 4)
      .attr("fill", "#D8F3DC").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => d.v);
  }, [profile]);
  return <svg ref={ref} role="img" aria-label="Reputation breakdown" />;
}
