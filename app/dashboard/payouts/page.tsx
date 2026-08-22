"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import type { Payout } from "../../lib/types";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function Badge({ status }: { status: Payout["status"] }) {
  const map = {
    pending:    { bg: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A",  label: "Pending" },
    processing: { bg: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE",  label: "Processing" },
    paid:       { bg: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0",  label: "Paid" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: s.bg, color: s.color, border: s.border }}>
      {s.label}
    </span>
  );
}

export default function PayoutsPage() {
  const router = useRouter();
  const [payouts,  setPayouts]  = useState<Payout[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiGet<Payout[]>("/seller/payouts")
      .then(setPayouts)
      .catch((err: Error) => {
        if (err.message === "401") { clearToken(); router.replace("/login"); }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const pending = payouts.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
  const paid    = payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Payouts</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Your earnings and payout history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>Pending Payouts</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#CC0000", letterSpacing: "-0.02em" }}>{fmt(pending)}</p>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 6 }}>Will be transferred within 7 days of delivery</p>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, color: "#888888", fontWeight: 500, marginBottom: 8 }}>Total Paid Out</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#166534", letterSpacing: "-0.02em" }}>{fmt(paid)}</p>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 6 }}>Lifetime earnings transferred to your account</p>
        </div>
      </div>

      {/* Payout history */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 16 }}>Payout History</h2>

        {payouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#AAAAAA" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <p style={{ fontSize: 14 }}>No payouts yet.</p>
            <p style={{ fontSize: 13, marginTop: 6, color: "#CCCCCC" }}>Payouts appear here after your first delivered order.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                  {["Date", "Orders", "Amount", "Status", "Invoice"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#888888", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ padding: "13px 10px", color: "#333333", whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "13px 10px", color: "#555555" }}>{p.orderCount} order{p.orderCount !== 1 ? "s" : ""}</td>
                    <td style={{ padding: "13px 10px", fontWeight: 700, color: p.status === "paid" ? "#166534" : "#111111" }}>{fmt(p.amount)}</td>
                    <td style={{ padding: "13px 10px" }}><Badge status={p.status} /></td>
                    <td style={{ padding: "13px 10px" }}>
                      {p.invoiceUrl ? (
                        <a
                          href={p.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 13, color: "#CC0000", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 500 }}
                        >
                          Download
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: "#CCCCCC" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 16, textAlign: "center" }}>
        Commission: 17% per sale · Payouts within 7 days of delivery · No deductions for unsold inventory
      </p>
    </>
  );
}
