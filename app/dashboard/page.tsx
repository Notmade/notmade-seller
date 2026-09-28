"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, inr, fmtDate, type Order, type Product } from "../lib/seller-api";
import { useDashboardSeller } from "./seller-context";
import { Alert, Badge, Card, FullPageSpinner, PageHeader, RED } from "../components/portal-ui";

const OPEN_STATUSES = ["pending", "confirmed", "processing", "packed"];

function StatCard({ label, value, sub, accent = false, href }: { label: string; value: string; sub?: string; accent?: boolean; href?: string }) {
  const inner = (
    <Card style={{ borderLeft: accent ? `3px solid ${RED}` : undefined, height: "100%" }}>
      <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent ? RED : "#111111", letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "#AAAAAA", marginTop: 6 }}>{sub}</p>}
    </Card>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const seller = useDashboardSeller();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.products(), api.orders()])
      .then(([p, o]) => { setProducts(p.products); setOrders(o.orders); })
      .catch(err => setError(err instanceof Error ? err.message : "Could not load dashboard"));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!products || !orders) return <FullPageSpinner />;

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthOrders = orders.filter(o => new Date(o.created_at) >= monthStart && o.status !== "cancelled");
  const toAccept = orders.filter(o => !o.multi_seller && !o.seller_accepted_at && OPEN_STATUSES.includes(o.status));
  const live = products.filter(p => p.is_live).length;
  const inReview = products.filter(p => p.approval_status === "pending").length;

  return (
    <div>
      <PageHeader title={`Hi, ${seller.contact_name?.split(" ")[0] || seller.business_name || "there"}`}
        sub={`${seller.business_name ?? ""} · Commission ${seller.commission_rate ?? "—"}%`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Sales this month" value={inr(monthOrders.reduce((s, o) => s + o.seller_subtotal, 0))} sub={`${monthOrders.length} orders`} />
        <StatCard label="Orders to accept" value={String(toAccept.length)} accent={toAccept.length > 0} href="/dashboard/orders" />
        <StatCard label="Live products" value={String(live)} sub={`${products.length} total`} href="/dashboard/products" />
        <StatCard label="Awaiting review" value={String(inReview)} sub="Products pending approval" href="/dashboard/products" />
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #EEEEEE" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111111" }}>Recent orders</h2>
          <Link href="/dashboard/orders" style={{ fontSize: 13, fontWeight: 600, color: RED, textDecoration: "none" }}>View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p style={{ padding: "28px 20px", fontSize: 14, color: "#888888", textAlign: "center" }}>
            No orders yet. {products.length === 0 && <Link href="/dashboard/products" style={{ color: RED, fontWeight: 600 }}>Add your first product</Link>}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {orders.slice(0, 5).map(o => (
              <li key={o.ref_no} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #F3F3F3", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>
                    {o.items[0]?.product_name}{o.items.length > 1 && ` +${o.items.length - 1} more`}
                  </p>
                  <p style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>{o.ref_no} · {fmtDate(o.created_at)}{o.city && ` · ${o.city}`}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>{inr(o.seller_subtotal)}</span>
                <Badge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
