"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, fmtDate, fmtDateTime, type Order, type Product } from "../lib/seller-api";
import { ordersIn, revenueWindows, stockRows, stockState } from "../lib/insights";
import { formatMoney } from "../lib/currency";
import { lowStockThreshold } from "../lib/low-stock";
import { productStatus } from "../lib/product-status";
import { useDashboardSeller, useLive, useSellerCurrency } from "./seller-context";
import { Alert, Badge, Card, EmptyState, PageHeader, PageSkeleton, RED } from "../components/portal-ui";
import { PayoutBlockedNotice } from "../components/BankDetails";

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

function Action({ label, count, href }: { label: string; count: number; href: string }) {
  return <Link href={href} className={count ? "sp-action" : "sp-action idle"}><span>{label}</span><strong>{count}</strong></Link>;
}

const BUCKET: Record<Order["bucket"], string> = {
  new: "New", accepted: "Accepted", ready: "Ready", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", returns: "Return",
};

export default function DashboardPage() {
  const seller = useDashboardSeller();
  const { country, currency, timeZone, fmt } = useSellerCurrency();
  const { data: d, error, refresh } = useLive();
  const [allOrders, setAllOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [payoutBlocked, setPayoutBlocked] = useState(false);

  // A failed read only leaves the notice off: it has no number the page depends on
  useEffect(() => { api.payouts().then(p => setPayoutBlocked(!!p.payout_blocked)).catch(() => {}); }, []);

  const load = useCallback(async () => {
    try {
      const [o, p] = await Promise.all([api.orders(), api.products()]);
      setAllOrders(o.orders);
      setProducts(p.products);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load your orders");
    }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const threshold = lowStockThreshold(seller);
  const low = useMemo(() => stockRows(products ?? [])
    .filter(r => stockState(r.stock, threshold) !== "ok")
    .sort((a, b) => a.stock - b.stock), [products, threshold]);
  const revenue = useMemo(() => revenueWindows(ordersIn(allOrders ?? [], currency), timeZone), [allOrders, currency, timeZone]);

  const failed = error || loadError;
  if (failed && (!d || !allOrders)) {
    return <Alert>{failed} <button type="button" onClick={() => { void refresh(); void load(); }} className="sp-link">Retry</button></Alert>;
  }
  if (!d || !allOrders || !products) return <PageSkeleton />;

  const first = seller.contact_name?.split(" ")[0] || seller.business_name || "there";
  const recent = allOrders.slice(0, 6);
  const hasNothing = products.length === 0 && allOrders.length === 0;
  const inReview = products.filter(p => productStatus(p).key === "pending").length;
  const signed = seller.agreement?.signed_version;

  return (
    <div>
      <PageHeader title={`Hi, ${first}`} sub={seller.business_name ?? undefined}
        action={<Link href="/dashboard/orders" className="sp-btn-red">Go to orders →</Link>} />

      {d.pending_accept.overdue > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert kind="warn">
            {d.pending_accept.overdue} order{d.pending_accept.overdue > 1 ? "s are" : " is"} past the {d.sla_hours}-hour accept window.{" "}
            <Link href="/dashboard/orders?tab=new" style={{ color: "inherit", fontWeight: 700 }}>Accept or reject now →</Link>
          </Alert>
        </div>
      )}

      {payoutBlocked && <div style={{ marginBottom: 16 }}><PayoutBlockedNotice country={country} /></div>}

      {inReview > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert kind="info">
            <strong>{inReview === 1 ? "Product submitted, in review." : `${inReview} products submitted, in review.`}</strong>{" "}
            NOTMADE reviews each product before it goes live.{" "}
            <Link href="/dashboard/products" style={{ color: "inherit", fontWeight: 700 }}>See your catalogue</Link>
          </Alert>
        </div>
      )}

      {hasNothing && signed && (
        <div style={{ marginBottom: 16 }}>
          <Alert kind="success">
            <strong>Agreement signed.</strong> Version {signed}, signed on {fmtDate(seller.agreement?.signed_at)}.{" "}
            <Link href="/dashboard/agreement" style={{ color: "inherit", fontWeight: 700 }}>View or download</Link>
          </Alert>
        </div>
      )}

      {hasNothing ? (
        <EmptyState title="Add your first product" sub="Your orders, revenue and stock show up here once you are selling."
          action={<Link href="/dashboard/products?new=1" className="sp-btn-red">Add a product</Link>} />
      ) : (
        <>
          <div className="sp-actions" aria-label="Pending actions">
            <Action label="To accept" count={d.pending_accept.count} href="/dashboard/orders?tab=new" />
            <Action label="To pack" count={d.counts.accepted} href="/dashboard/orders?tab=accepted" />
            <Action label="To ship" count={d.ready_for_pickup.count} href="/dashboard/orders?tab=ready" />
            <Action label="Returns" count={d.returns.open} href="/dashboard/orders?tab=returns" />
          </div>

          <div className="sp-stats">
            <Stat label="Today's orders" value={String(revenue.today.orders)} sub={`${fmt(revenue.today.revenue)} in sales`} tone="dark" />
            <Stat label="Revenue, 7 days" value={fmt(revenue.week.revenue)} sub={`${revenue.week.orders} orders`} href="/dashboard/analytics" />
            <Stat label="Revenue, 30 days" value={fmt(revenue.month.revenue)} sub={`${revenue.month.orders} orders`} href="/dashboard/analytics" />
            <Stat label="Low stock" value={String(low.length)} sub={`${threshold} or fewer left`} tone={low.length ? "red" : undefined} href="/dashboard/inventory?filter=low" />
          </div>

          <div className="sp-dash-grid">
            <Card style={{ padding: 0 }}>
              <div className="sp-card-head">
                <h2>Recent orders</h2>
                <Link href="/dashboard/orders">View all →</Link>
              </div>
              {recent.length === 0 ? (
                <p style={{ padding: "28px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>
                  No orders yet. <Link href="/dashboard/products" style={{ color: RED, fontWeight: 600 }}>Check your catalogue</Link>
                </p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {recent.map(o => (
                    <li key={o.ref_no}>
                      <Link href={`/dashboard/orders?tab=${o.bucket}&ref=${encodeURIComponent(o.ref_no)}`} className="sp-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {o.items[0]?.product_name}{o.items.length > 1 && ` +${o.items.length - 1}`}
                          </p>
                          <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{o.ref_no} · {fmtDateTime(o.created_at)}</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{formatMoney(o.commission.gross, o.commission.currency)}</span>
                        <Badge status={o.bucket === "new" ? "awaiting" : o.bucket === "cancelled" ? "cancelled" : o.bucket === "delivered" ? "delivered" : "packed"} label={BUCKET[o.bucket]} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card style={{ padding: 0 }}>
              <div className="sp-card-head">
                <h2>Low-stock alerts</h2>
                <Link href="/dashboard/inventory?filter=low">Update →</Link>
              </div>
              {low.length === 0 ? (
                <p style={{ padding: "28px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>Everything is well stocked.</p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {low.slice(0, 6).map(r => (
                    <li key={r.key} className="sp-row" style={{ cursor: "default" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                        {r.variant && <p style={{ fontSize: 12, color: "#888" }}>{r.variant}</p>}
                      </div>
                      <span className={`sp-stock-tag ${r.stock <= 0 ? "out" : "low"}`}>{r.stock <= 0 ? "Out of stock" : `${r.stock} left`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

