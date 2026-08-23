"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../lib/auth";
import { supabase } from "../lib/supabase";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #EEEEEE",
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      borderLeft: accent ? "3px solid #CC0000" : undefined,
    }}>
      <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent ? "#CC0000" : "#111111", letterSpacing: "-0.02em" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "#AAAAAA", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    pending:            { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" },
    seller_accepted:    { background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
    ready_to_dispatch:  { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
    dispatched:         { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
    delivered:          { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
    cancelled:          { background: "#FFF5F5", color: "#CC0000", border: "1px solid #FECACA" },
  };
  const label = status.replace(/_/g, ' ');
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, textTransform: "capitalize", ...(map[status] ?? { background: "#F5F5F5", color: "#555" }) }}>
      {label}
    </span>
  );
}

interface OrderRow {
  id: string;
  order_id: string;
  status: string;
  price_inr: number;
  product_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [revenue,  setRevenue]  = useState(0);
  const [pending,  setPending]  = useState(0);
  const [products, setProducts] = useState(0);
  const [orders,   setOrders]   = useState<OrderRow[]>([]);

  useEffect(() => {
    const sellerId = getSellerId();
    if (!sellerId) { clearToken(); router.replace("/login"); return; }

    Promise.allSettled([
      supabase.from('orders').select('price_inr, status, created_at').eq('seller_id', sellerId),
      supabase.from('products').select('id, review_status', { count: 'exact' }).eq('seller_id', sellerId).eq('review_status', 'approved').is('deleted_at', null),
      supabase.from('seller_payouts').select('payout_amount, status').eq('seller_id', sellerId).eq('status', 'pending'),
      supabase.from('orders').select('id, order_id, status, price_inr, product_name, created_at').eq('seller_id', sellerId).order('created_at', { ascending: false }).limit(5),
    ]).then(([ordersRes, productsRes, payoutsRes, recentRes]) => {
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear  = now.getFullYear();
        const monthRev = ordersRes.value.data
          .filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && o.status !== 'cancelled';
          })
          .reduce((s, o) => s + (Number(o.price_inr) * 0.83), 0);
        setRevenue(monthRev);
      }
      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.count ?? 0);
      }
      if (payoutsRes.status === 'fulfilled' && payoutsRes.value.data) {
        setPending(payoutsRes.value.data.reduce((s, p) => s + Number(p.payout_amount), 0));
      }
      if (recentRes.status === 'fulfilled' && recentRes.value.data) {
        setOrders(recentRes.value.data as OrderRow[]);
      }
    }).finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Your seller overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue this month" value={fmt(revenue)} sub="after 17% commission" />
        <StatCard label="Pending payouts"    value={fmt(pending)} accent sub="awaiting transfer" />
        <StatCard label="Active products"    value={String(products)} />
        <StatCard label="Recent orders"      value={String(orders.length)} sub="last 5 shown" />
      </div>

      {/* Recent orders */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 16 }}>Recent Orders</h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#AAAAAA" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p style={{ fontSize: 14 }}>No orders yet.</p>
            <p style={{ fontSize: 13, marginTop: 6, color: "#CCCCCC" }}>Orders appear once customers buy your products.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                  {["Order ID", "Product", "Sale", "Commission (17%)", "Your Payout", "Status"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#888888", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const sale       = Number(o.price_inr);
                  const commission = sale * 0.17;
                  const payout     = sale * 0.83;
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#111111", whiteSpace: "nowrap" }}>#{o.order_id}</td>
                      <td style={{ padding: "12px 10px", color: "#333333", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product_name}</td>
                      <td style={{ padding: "12px 10px", color: "#111111", whiteSpace: "nowrap" }}>{fmt(sale)}</td>
                      <td style={{ padding: "12px 10px", color: "#CC0000", whiteSpace: "nowrap" }}>−{fmt(commission)}</td>
                      <td style={{ padding: "12px 10px", color: "#166534", fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(payout)}</td>
                      <td style={{ padding: "12px 10px" }}><Badge status={o.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
