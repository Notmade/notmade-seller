"use client";

import { useEffect, useState } from "react";
import { api, amountIn, fmtDate, money, type Payout, type UpcomingSettlement, type Money } from "../../lib/seller-api";
import { Alert, Badge, Card, FullPageSpinner, PageHeader } from "../../components/portal-ui";
import { useDashboardSeller } from "../seller-context";

interface Data { payouts: Payout[]; upcoming: UpcomingSettlement[]; totals: { paid: Money; scheduled: Money; upcoming: Money }; settlement_days: number }

export default function PayoutsPage() {
  const seller = useDashboardSeller();
  const [d, setD] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.payouts().then(setD).catch(err => setError(err instanceof Error ? err.message : "Could not load payouts"));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!d) return <FullPageSpinner />;

  const rates = [
    seller.commission?.india_pct != null && `India ${seller.commission.india_pct}%`,
    seller.uae?.commission_pct != null && `UAE ${seller.uae.commission_pct}%`,
  ].filter(Boolean).join(" · ");

  return (
    <div>
      <PageHeader title="Payouts" sub={`Settled ${d.settlement_days} days after delivery${rates ? ` · Commission ${rates}` : ""}`} />

      <div className="sp-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="sp-stat sp-stat-dark"><p className="sp-stat-label">Upcoming (delivered)</p><p className="sp-stat-value">{money(d.totals.upcoming)}</p><p className="sp-stat-sub">{d.upcoming.length} order{d.upcoming.length === 1 ? "" : "s"} in the {d.settlement_days}-day window</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Scheduled</p><p className="sp-stat-value">{money(d.totals.scheduled)}</p><p className="sp-stat-sub">Settlement created, transfer pending</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Paid out</p><p className="sp-stat-value" style={{ color: "#166534" }}>{money(d.totals.paid)}</p><p className="sp-stat-sub">Transferred to your bank</p></div>
      </div>

      <Card style={{ padding: 0, marginBottom: 16 }}>
        <div className="sp-card-head"><h2>Upcoming settlements</h2></div>
        {d.upcoming.length === 0 ? (
          <p style={{ padding: "24px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>Delivered orders show up here with their settlement date.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sp-table">
              <thead><tr><th>Order</th><th>Order value</th><th>Commission</th><th>You get</th><th>Settles on</th></tr></thead>
              <tbody>
                {d.upcoming.map(u => (
                  <tr key={u.ref_no}>
                    <td style={{ fontWeight: 700 }}>{u.ref_no}</td>
                    <td>{amountIn(u.currency, u.gross)}</td>
                    <td style={{ color: "#CC0000" }}>{u.commission != null ? `−${amountIn(u.currency, u.commission)}` : "—"}{u.commission_pct != null && <span style={{ color: "#999" }}> ({u.commission_pct}%)</span>}</td>
                    <td style={{ fontWeight: 700 }}>{u.payout != null ? amountIn(u.currency, u.payout) : "—"}</td>
                    <td>{fmtDate(u.settlement_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0 }}>
        <div className="sp-card-head"><h2>Settlement history</h2></div>
        {d.payouts.length === 0 ? (
          <p style={{ padding: "24px 20px", fontSize: 14, color: "#888", textAlign: "center" }}>No settlements yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sp-table">
              <thead><tr><th>Created</th><th>Amount</th><th>Commission</th><th>Due / paid</th><th>Status</th><th>Reference</th><th>Statement</th></tr></thead>
              <tbody>
                {d.payouts.map(p => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.created_at)}</td>
                    <td style={{ fontWeight: 700 }}>{amountIn(p.currency, p.amount)}</td>
                    <td style={{ color: "#CC0000" }}>{p.commission != null ? `−${amountIn(p.currency, p.commission)}` : "—"}</td>
                    <td>{fmtDate(p.paid_at || p.due_date)}</td>
                    <td><Badge status={p.status === "paid" ? "approved" : "pending"} label={p.status === "paid" ? "Paid" : "Scheduled"} /></td>
                    <td style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12 }}>{p.reference || "—"}</td>
                    <td>{p.invoice_url ? <a href={p.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: "#CC0000", fontWeight: 600 }}>Download</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
