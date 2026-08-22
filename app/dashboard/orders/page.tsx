"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import type { Order } from "../../lib/types";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function Badge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    pending:    { background: "#FFFBEB", color: "#B45309",  border: "1px solid #FDE68A" },
    confirmed:  { background: "#EFF6FF", color: "#1E40AF",  border: "1px solid #BFDBFE" },
    dispatched: { background: "#F5F3FF", color: "#6D28D9",  border: "1px solid #DDD6FE" },
    delivered:  { background: "#F0FDF4", color: "#166534",  border: "1px solid #BBF7D0" },
    cancelled:  { background: "#FFF5F5", color: "#CC0000",  border: "1px solid #FECACA" },
  };
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, textTransform: "capitalize", ...(map[status] ?? { background: "#F5F5F5", color: "#555" }) }}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Order[]>("/seller/orders")
      .then(setOrders)
      .catch((err: Error) => {
        if (err.message === "401") { clearToken(); router.replace("/login"); }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const markReady = async (id: string) => {
    setMarking(id);
    try {
      await apiFetch(`/seller/orders/${id}/ready`, { method: "POST", body: JSON.stringify({}) });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, readyForPickup: true } : o));
    } catch { /* silent */ } finally {
      setMarking(null);
    }
  };

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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Orders</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "64px 24px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", color: "#CCCCCC" }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p style={{ fontSize: 15, color: "#888888", fontWeight: 600 }}>No orders yet</p>
          <p style={{ fontSize: 13, color: "#CCCCCC", marginTop: 6 }}>Orders will appear here once customers purchase your products.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                {/* Left */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>#{o.orderId}</span>
                    <Badge status={o.status} />
                    {o.readyForPickup && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                        Ready for Pickup
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: "#333333", marginBottom: 4 }}>{o.productName}</p>
                  <p style={{ fontSize: 12, color: "#888888" }}>
                    {o.customerCity} · {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {o.quantity > 1 && ` · Qty: ${o.quantity}`}
                  </p>
                </div>

                {/* Right: commission breakdown */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#888888" }}>Sale</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>{fmt(o.salePrice)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#888888" }}>Commission (17%)</span>
                    <span style={{ fontSize: 13, color: "#CC0000" }}>−{fmt(o.commission)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid #EEEEEE" }}>
                    <span style={{ fontSize: 12, color: "#888888", fontWeight: 600 }}>Your Payout</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{fmt(o.payout)}</span>
                  </div>
                </div>
              </div>

              {/* Mark ready */}
              {!o.readyForPickup && (o.status === "pending" || o.status === "confirmed") && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F5F5F5" }}>
                  <button
                    onClick={() => markReady(o.id)}
                    disabled={marking === o.id}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: marking === o.id ? "not-allowed" : "pointer",
                      border: "1.5px solid #CC0000",
                      background: "transparent",
                      color: "#CC0000",
                      transition: "background 0.15s, color 0.15s",
                      opacity: marking === o.id ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#CC0000"; e.currentTarget.style.color = "#FFF"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#CC0000"; }}
                  >
                    {marking === o.id ? "Marking…" : "Mark Ready for Pickup"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
