"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "../lib/api";
import { clearToken } from "../lib/auth";
import type { DashboardStats, Order } from "../lib/types";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEEEEE",
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent ? "#CC0000" : "#111111", letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    pending:    { background: "#FFFBEB", color: "#B45309",  border: "1px solid #FDE68A" },
    confirmed:  { background: "#F0FDF4", color: "#166534",  border: "1px solid #BBF7D0" },
    dispatched: { background: "#EFF6FF", color: "#1E40AF",  border: "1px solid #BFDBFE" },
    delivered:  { background: "#F0FDF4", color: "#166534",  border: "1px solid #BBF7D0" },
    cancelled:  { background: "#FFF5F5", color: "#CC0000",  border: "1px solid #FECACA" },
  };
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, textTransform: "capitalize", ...(map[status] ?? { background: "#F5F5F5", color: "#555" }) }}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiGet<DashboardStats>("/seller/dashboard"),
      apiGet<Order[]>("/seller/orders?limit=5"),
    ]).then(([sr, or]) => {
      if (sr.status === "fulfilled") setStats(sr.value);
      if (or.status === "fulfilled") setOrders(or.value);
      if (sr.status === "rejected" && (sr.reason as Error).message === "401") {
        clearToken(); router.replace("/login");
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
        <StatCard label="Sales this month"  value={stats ? fmt(stats.totalSalesThisMonth) : "—"} />
        <StatCard label="Pending payouts"   value={stats ? fmt(stats.pendingPayouts) : "—"} accent />
        <StatCard label="Active products"   value={stats ? String(stats.activeProducts) : "—"} />
        <StatCard label="Total orders"      value={stats ? String(stats.totalOrders) : "—"} />
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
            <p style={{ fontSize: 13, marginTop: 6, color: "#CCCCCC" }}>Orders will appear once customers buy your products.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                  {["Order ID", "Product", "Sale", "Commission (17%)", "Payout", "Status"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#888888", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 600, color: "#111111", whiteSpace: "nowrap" }}>#{o.orderId}</td>
                    <td style={{ padding: "12px 10px", color: "#333333", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.productName}</td>
                    <td style={{ padding: "12px 10px", color: "#111111", whiteSpace: "nowrap" }}>{fmt(o.salePrice)}</td>
                    <td style={{ padding: "12px 10px", color: "#CC0000", whiteSpace: "nowrap" }}>−{fmt(o.commission)}</td>
                    <td style={{ padding: "12px 10px", color: "#166534", fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(o.payout)}</td>
                    <td style={{ padding: "12px 10px" }}><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
