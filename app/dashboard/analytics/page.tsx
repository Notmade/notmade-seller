"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Order, type SellerAnalytics } from "../../lib/seller-api";
import { orderFunnel, ordersByStatus, ordersIn, salesSeries, topProducts } from "../../lib/insights";
import { featureOn } from "../../lib/features";
import { useSellerCurrency } from "../seller-context";
import { Alert, Card, EmptyState, PageHeader, PageSkeleton } from "../../components/portal-ui";

const RANGES = [7, 30, 90] as const;
const DAY = 86_400_000;

const shortDay = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function AnalyticsPage() {
  const { currency, timeZone, fmt } = useSellerCurrency();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [asTable, setAsTable] = useState(false);
  const [traffic, setTraffic] = useState<SellerAnalytics | null>(null);

  useEffect(() => {
    api.orders().then(o => setOrders(ordersIn(o.orders, currency)))
      .catch(err => setError(err instanceof Error ? err.message : "Could not load analytics"));
  }, [currency]);
  useEffect(() => {
    // Store traffic is optional: without it the page shows order-side conversion only
    if (!featureOn("store_analytics")) return;
    api.analytics(days).then(setTraffic).catch((err: unknown) => { if (err instanceof ApiError) setTraffic(null); });
  }, [days]);

  const inRange = useMemo(() => {
    const from = Date.now() - days * DAY;
    return (orders ?? []).filter(o => new Date(o.created_at).getTime() >= from);
  }, [orders, days]);
  const series = useMemo(() => salesSeries(inRange, days, timeZone), [inRange, days, timeZone]);
  const top = useMemo(() => topProducts(inRange), [inRange]);
  const status = useMemo(() => ordersByStatus(inRange), [inRange]);
  const funnel = useMemo(() => orderFunnel(inRange), [inRange]);

  if (error) return <Alert>{error}</Alert>;
  if (!orders) return <PageSkeleton rows={4} />;
  if (orders.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" />
        <EmptyState title="No sales to show yet" sub="Your sales, top products and order status appear here after your first order."
          action={<Link href="/dashboard/products" className="sp-btn-red">Check your catalogue</Link>} />
      </div>
    );
  }

  const total = series.reduce((s, p) => s + p.revenue, 0);
  const count = series.reduce((s, p) => s + p.orders, 0);
  const peak = Math.max(...series.map(p => p.revenue), 1);
  const maxStatus = Math.max(...status.map(s => s.count), 1);
  const conversion = traffic?.product_views ? Math.round((traffic.orders / traffic.product_views) * 1000) / 10 : null;

  return (
    <div>
      <PageHeader title="Analytics" sub={`Sales in ${currency}, from your orders.`}
        action={(
          <div className="sp-pills" role="group" aria-label="Date range">
            {RANGES.map(r => <button key={r} type="button" className="sp-pill" aria-pressed={days === r} onClick={() => setDays(r)}>{r} days</button>)}
          </div>
        )} />

      <div className="sp-stats">
        <div className="sp-stat sp-stat-dark"><p className="sp-stat-label">Sales</p><p className="sp-stat-value">{fmt(total)}</p><p className="sp-stat-sub">Last {days} days</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Orders</p><p className="sp-stat-value">{count}</p><p className="sp-stat-sub">Excludes cancelled</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Accepted</p><p className="sp-stat-value">{funnel.acceptRate != null ? `${funnel.acceptRate}%` : "—"}</p><p className="sp-stat-sub">{funnel.accepted} of {funnel.received} orders</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Store conversion</p><p className="sp-stat-value">{conversion != null ? `${conversion}%` : "—"}</p><p className="sp-stat-sub">{conversion != null ? `${traffic!.orders} orders from ${traffic!.product_views} views` : "Coming soon"}</p></div>
      </div>

      <Card style={{ padding: 0, marginBottom: 14 }}>
        <div className="sp-card-head">
          <h2>Sales over time</h2>
          <button type="button" className="sp-link" onClick={() => setAsTable(t => !t)}>{asTable ? "Show chart" : "Show table"}</button>
        </div>
        {asTable ? (
          <div style={{ overflowX: "auto", maxHeight: 320 }}>
            <table className="sp-table">
              <thead><tr><th scope="col">Day</th><th scope="col" className="sp-num">Orders</th><th scope="col" className="sp-num">Sales</th></tr></thead>
              <tbody>{series.filter(p => p.orders > 0).map(p => <tr key={p.day}><td>{shortDay(p.day)}</td><td className="sp-num">{p.orders}</td><td className="sp-num">{fmt(p.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="sp-chart" role="img" aria-label={`Daily sales for the last ${days} days, total ${fmt(total)}`}>
              {series.map(p => (
                <button key={p.day} type="button" className={p.revenue ? "sp-bar" : "sp-bar zero"} aria-label={`${shortDay(p.day)}: ${fmt(p.revenue)}, ${p.orders} orders`}>
                  <i style={{ height: `${Math.max((p.revenue / peak) * 100, 1)}%` }} />
                  <span className="sp-bar-tip">{shortDay(p.day)}<br />{fmt(p.revenue)} · {p.orders} order{p.orders === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
            <div className="sp-chart-axis"><span>{shortDay(series[0].day)}</span><span>Peak {fmt(peak)}</span><span>{shortDay(series[series.length - 1].day)}</span></div>
          </>
        )}
      </Card>

      <div className="sp-dash-grid">
        <Card style={{ padding: 0 }}>
          <div className="sp-card-head"><h2>Top products</h2></div>
          {top.length === 0 ? <p style={{ padding: "24px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>No sales in this range.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table className="sp-table">
                <thead><tr><th scope="col">Product</th><th scope="col" className="sp-num">Units</th><th scope="col" className="sp-num">Sales</th></tr></thead>
                <tbody>{top.map(p => <tr key={p.id}><td style={{ whiteSpace: "normal", fontWeight: 700 }}>{p.name}</td><td className="sp-num">{p.units}</td><td className="sp-num">{fmt(p.revenue)}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>
        <Card style={{ padding: "0 0 12px" }}>
          <div className="sp-card-head"><h2>Orders by status</h2></div>
          {status.length === 0 ? <p style={{ padding: "24px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>No orders in this range.</p> : (
            <ul style={{ listStyle: "none", margin: 0, padding: "8px 0 0" }}>
              {status.map(s => (
                <li key={s.bucket} className="sp-hbar">
                  <span>{s.label}</span>
                  <div style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                  <strong className="sp-num">{s.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
