"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, fmtDateTime, type DeliveryInfo, type DeliveryRules, type DeliveryStage, type Order } from "../../lib/seller-api";
import { Alert, Button, Card, EmptyState, FullPageSpinner, PageHeader, RED } from "../../components/portal-ui";
import { useSellerCurrency } from "../seller-context";

type Row = Order & { delivery: DeliveryInfo };
type Filter = "open" | "delayed" | "all";

const LANE: Record<DeliveryInfo["lane"], string> = { ncr_express: "NCR 3-hour", pan_india: "Pan-India", uae: "UAE" };
const GREEN = "#16A34A";

function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

const ago = (iso: string, now: number) => {
  const h = (now - new Date(iso).getTime()) / 3_600_000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
};
const until = (iso: string, now: number) => {
  const h = (new Date(iso).getTime() - now) / 3_600_000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
};
/** Promised dates are end-of-day in the order's market, so show them in that timezone (Dubai for UAE orders). */
const tzOf = (lane: DeliveryInfo["lane"]) => (lane === "uae" ? "Asia/Dubai" : "Asia/Kolkata");
const day = (iso: string, lane: DeliveryInfo["lane"]) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: tzOf(lane) });
const dayTime = (iso: string, lane: DeliveryInfo["lane"]) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tzOf(lane) });

/** Eight stages, left to right. Done = red dot, late = red ring with the deadline, next = grey with its due time. */
function Stages({ stages, now }: { stages: DeliveryStage[]; now: number }) {
  return (
    <ol style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`, gap: 0, marginTop: 14, overflowX: "auto" }} aria-label="Delivery stages">
      {stages.map((s, i) => {
        const late = s.late && !s.done;
        const dot = s.done ? (s.late ? "#F59E0B" : RED) : late ? "#FFFFFF" : "#FFFFFF";
        const ring = s.done ? (s.late ? "#F59E0B" : RED) : late ? RED : "#DDDDDD";
        return (
          <li key={s.key} style={{ position: "relative", minWidth: 84, paddingRight: 6 }} aria-current={!s.done && (i === 0 || stages[i - 1].done) ? "step" : undefined}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: dot, border: `2px solid ${ring}`, flexShrink: 0, boxShadow: late ? "0 0 0 4px rgba(204,0,0,0.12)" : "none" }} />
              {i < stages.length - 1 && <span style={{ flex: 1, height: 2, background: stages[i + 1].done ? RED : "#EEEEEE" }} />}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: s.done ? "#111111" : late ? RED : "#888888", marginTop: 6, lineHeight: 1.25 }}>{s.label}</p>
            {s.at && s.done && <p style={{ fontSize: 11, color: "#888888", marginTop: 2 }}>{fmtDateTime(s.at)}</p>}
            {!s.done && s.due_by && (
              <p style={{ fontSize: 11, color: late ? RED : "#999999", marginTop: 2, fontWeight: late ? 700 : 400 }}>
                {late ? `Late ${ago(s.due_by, now)}` : `Due in ${until(s.due_by, now)}`}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function DeliveryTimelinePage() {
  const { country, uaeApproved } = useSellerCurrency();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("open");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [rules, setRules] = useState<DeliveryRules | null>(null);
  const [summary, setSummary] = useState({ open: 0, delayed: 0, due_today: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.deliveryTimeline(filter === "all" ? "all" : "open");
      setRows(r.orders);
      setRules(r.rules);
      setSummary(r.summary);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the delivery timeline");
      setRows((x) => x ?? []);
    }
  }, [filter]);
  useEffect(() => { void load(); const t = setInterval(() => void load(), 120_000); return () => clearInterval(t); }, [load]);

  const markReady = async (ref: string) => {
    setBusy(ref);
    try { await api.markReady(ref); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update the order"); }
    finally { setBusy(null); }
  };

  if (!rows) return <FullPageSpinner />;
  const shown = filter === "delayed" ? rows.filter((r) => r.delivery.delayed) : rows;

  const stat = (label: string, value: number, color = "#111111") => (
    <Card style={{ padding: "16px 18px" }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888888" }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4 }}>{value}</p>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Delivery Timeline"
        sub="Every order, stage by stage, with the delivery date NOTMADE promised the customer. Late stages are highlighted and flagged to NOTMADE."
        action={<Button variant="secondary" onClick={() => void load()}>Refresh</Button>}
      />

      {error && <div style={{ marginBottom: 16 }}><Alert>{error}</Alert></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
        {stat("Open orders", summary.open)}
        {stat("Delayed", summary.delayed, summary.delayed ? RED : GREEN)}
        {stat("Due today", summary.due_today)}
      </div>

      {rules && (
        <Card style={{ padding: "14px 18px", marginBottom: 18 }}>
          <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.6 }}>
            <strong style={{ color: "#111111" }}>Delivery promises</strong> (set by NOTMADE):{" "}
            {country === "AE" ? <>UAE {rules.uae.min_days}–{rules.uae.max_days} days.{" "}</> : <>
              {rules.ncr_express.enabled && <>Delhi NCR {rules.ncr_express.hours}-hour delivery for orders between {rules.ncr_express.window_start} and {rules.ncr_express.window_end} · </>}
              Pan-India {rules.pan_india.min_days}–{rules.pan_india.max_days} days{uaeApproved && <> · UAE {rules.uae.min_days}–{rules.uae.max_days} days</>}.{" "}
            </>}
            <strong style={{ color: "#111111" }}>Your deadlines:</strong> accept within {rules.sla_hours.accept} h, ready to ship within {rules.sla_hours.ready} h of accepting, handed to the courier within {rules.sla_hours.pickup} h of ready.
          </p>
        </Card>
      )}

      <div role="tablist" aria-label="Filter" style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["open", "delayed", "all"] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} type="button" onClick={() => setFilter(f)} style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            border: `1.5px solid ${filter === f ? "#111111" : "#E0E0E0"}`, background: filter === f ? "#111111" : "#FFFFFF", color: filter === f ? "#FFFFFF" : "#555555",
          }}>
            {f === "open" ? "Open" : f === "delayed" ? `Delayed (${summary.delayed})` : "All orders"}
          </button>
        ))}
      </div>

      {!shown.length ? (
        <EmptyState title={filter === "delayed" ? "Nothing is late" : "No orders here"} sub={filter === "delayed" ? "Every open order is on time." : "Orders show up here as soon as they're placed."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((o) => {
            const d = o.delivery;
            const late = d.delayed;
            return (
              <Card key={o.ref_no} style={{ borderColor: late ? RED : "#EEEEEE", borderWidth: late ? 2 : 1, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, fontSize: 15, color: "#111111" }}>{o.ref_no}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: o.region === "ae" ? "#111111" : "#F3F3F3", color: o.region === "ae" ? "#FFFFFF" : "#333333" }}>{LANE[d.lane]}</span>
                      {late && <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: RED, color: "#FFFFFF" }}>DELAYED</span>}
                    </div>
                    <p style={{ fontSize: 13, color: "#777777", marginTop: 4 }}>
                      {o.items.map((i) => `${i.product_name}${i.label ? ` (${i.label})` : ""} ×${i.quantity}`).join(", ")}
                    </p>
                    <p style={{ fontSize: 12, color: "#999999", marginTop: 2 }}>Placed {fmtDateTime(o.created_at)}{o.city ? ` · ${o.city}` : ""}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 12, color: "#888888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Expected delivery</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: late ? RED : "#111111", marginTop: 2 }}>
                      {d.lane === "ncr_express" ? dayTime(d.expected_delivery_at, d.lane) : `${d.expected_from ? `${day(d.expected_from, d.lane)} – ` : ""}${day(d.expected_delivery_at, d.lane)}`}
                    </p>
                    <p style={{ fontSize: 12, color: "#999999" }}>{d.expected_label}</p>
                  </div>
                </div>

                {late && d.delay && (
                  <div role="alert" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(204,0,0,0.06)", color: RED, fontSize: 13, fontWeight: 700 }}>
                    “{d.delay.label}” was due {fmtDateTime(d.delay.due_by)}, {d.delay.overdue_hours} h ago. NOTMADE has been notified.
                  </div>
                )}

                <Stages stages={d.stages} now={now} />

                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {o.seller_status === "awaiting" && <Link href="/dashboard/orders" style={{ fontSize: 13, fontWeight: 700, color: RED }}>Accept or reject in Orders →</Link>}
                  {o.seller_status === "accepted" && o.bucket === "accepted" && (
                    <Button onClick={() => void markReady(o.ref_no)} disabled={busy === o.ref_no} style={{ padding: "8px 14px", fontSize: 13 }}>
                      {busy === o.ref_no ? "Updating…" : "Mark ready to ship"}
                    </Button>
                  )}
                  {o.waybill && <span style={{ fontSize: 12, color: "#555555", alignSelf: "center" }}>AWB {o.waybill}{o.courier ? ` · ${o.courier}` : ""}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
