"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, amountIn, fmtDate, fmtDateTime, money, type DashboardData } from "../lib/seller-api";
import { useDashboardSeller } from "./seller-context";
import { Alert, Badge, Card, FullPageSpinner, PageHeader, RED } from "../components/portal-ui";

function Stat({ label, value, sub, tone, href }: { label: string; value: string; sub?: string; tone?: "red" | "dark"; href?: string }) {
  const inner = (
    <div className={`sp-stat${tone === "red" ? " sp-stat-red" : tone === "dark" ? " sp-stat-dark" : ""}`}>
      <p className="sp-stat-label">{label}</p>
      <p className="sp-stat-value">{value}</p>
      {sub && <p className="sp-stat-sub">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="sp-stat-link">{inner}</Link> : inner;
}

function timeLeft(iso: string | null) {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "overdue";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `next due in ${h ? `${h}h ` : ""}${m}m`;
}

export default function DashboardPage() {
  const seller = useDashboardSeller();
  const [d, setD] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (quiet = false) => {
    try { setD(await api.dashboard()); setError(""); }
    catch (err) { if (!quiet) setError(err instanceof Error ? err.message : "Could not load dashboard"); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(true); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!d) return <FullPageSpinner />;

  const first = seller.contact_name?.split(" ")[0] || seller.business_name || "there";
  const rates = [
    seller.commission?.india_pct != null && `India ${seller.commission.india_pct}%`,
    seller.uae?.commission_pct != null && seller.uae.ready && `UAE ${seller.uae.commission_pct}%`,
  ].filter(Boolean).join(" · ");

  return (
    <div>
      <PageHeader title={`Hi, ${first}`} sub={`${seller.business_name ?? ""}${rates ? ` · Commission ${rates}` : ""}`}
        action={<Link href="/dashboard/orders" className="sp-btn-red">Go to orders →</Link>} />

      {d.pending_accept.overdue > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert kind="warn">
            {d.pending_accept.overdue} order{d.pending_accept.overdue > 1 ? "s are" : " is"} past the {d.sla_hours}-hour accept window.{" "}
            <Link href="/dashboard/orders?tab=new" style={{ color: "inherit", fontWeight: 700 }}>Accept or reject now →</Link>
          </Alert>
        </div>
      )}

      <div className="sp-stats">
        <Stat label="Today's orders" value={String(d.today.orders)} sub={`Payout ${money(d.today.payout)}`} tone="dark" />
        <Stat label="Pending accept" value={String(d.pending_accept.count)} tone={d.pending_accept.count ? "red" : undefined}
          sub={d.pending_accept.count ? timeLeft(d.pending_accept.next_due_at) : `Accept within ${d.sla_hours}h`} href="/dashboard/orders?tab=new" />
        <Stat label="Ready for pickup" value={String(d.ready_for_pickup.count)}
          sub={`${d.ready_for_pickup.awb_generated} with AWB · ${d.ready_for_pickup.awaiting_awb} awaiting AWB`} href="/dashboard/orders?tab=ready" />
        <Stat label="Earnings this month" value={money(d.earnings.month)} sub={`Delivered lifetime ${money(d.earnings.delivered_lifetime)}`} />
        <Stat label="Next settlement" value={d.next_settlement ? money(d.next_settlement.amount) : "—"}
          sub={d.next_settlement ? `${d.next_settlement.source === "estimate" ? "Expected " : ""}${fmtDate(d.next_settlement.date)}` : `${d.settlement_days} days after delivery`} href="/dashboard/payouts" />
        <Stat label="Low stock" value={String(d.low_stock.count)} sub={`${d.low_stock.threshold} or fewer left`} tone={d.low_stock.count ? "red" : undefined} href="/dashboard/products" />
        <Stat label="Returns" value={String(d.returns.open)} sub="Open requests" href="/dashboard/orders?tab=returns" />
        <Stat label="Live products" value={String(d.products.live)} sub={`${d.products.pending} in review · ${d.products.rejected} need changes`} href="/dashboard/products" />
      </div>

      <div className="sp-dash-grid">
        <Card style={{ padding: 0 }}>
          <div className="sp-card-head">
            <h2>Recent orders</h2>
            <Link href="/dashboard/orders">View all →</Link>
          </div>
          {d.recent_orders.length === 0 ? (
            <p style={{ padding: "28px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>
              No orders yet. {d.products.total === 0 && <Link href="/dashboard/products" style={{ color: RED, fontWeight: 600 }}>Add your first product</Link>}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {d.recent_orders.map(o => (
                <li key={o.ref_no}>
                  <Link href={`/dashboard/orders?tab=${o.bucket}&ref=${encodeURIComponent(o.ref_no)}`} className="sp-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.items[0]?.product_name}{o.items.length > 1 && ` +${o.items.length - 1}`}
                      </p>
                      <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{o.ref_no} · {fmtDateTime(o.created_at)}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{amountIn(o.commission.currency, o.commission.payout ?? o.commission.gross)}</span>
                    <Badge status={o.bucket === "new" ? "awaiting" : o.bucket === "cancelled" ? "cancelled" : o.bucket === "delivered" ? "delivered" : "packed"}
                      label={{ new: "New", accepted: "Accepted", ready: o.waybill ? "AWB ready" : "Ready", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", returns: "Return" }[o.bucket]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card style={{ padding: 0 }}>
          <div className="sp-card-head">
            <h2>Low stock</h2>
            <Link href="/dashboard/products">Update →</Link>
          </div>
          {d.low_stock.items.length === 0 ? (
            <p style={{ padding: "28px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>Everything is well stocked.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {d.low_stock.items.map((p, i) => (
                <li key={i} className="sp-row" style={{ cursor: "default" }}>
                  {p.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.image} alt="" width={36} height={44} style={{ width: 36, height: 44, objectFit: "cover", borderRadius: 6 }} />
                    : <div style={{ width: 36, height: 44, borderRadius: 6, background: "#F3F3F3" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    {p.variant && <p style={{ fontSize: 12, color: "#888" }}>{p.variant}</p>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: p.stock === 0 ? RED : "#B45309" }}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
