"use client";

import { useEffect, useState } from "react";
import { api, fmtDate, type Payout, type UpcomingSettlement, type Money } from "../lib/seller-api";
import { formatMoney, formatMoneyIn, otherCurrency, type Currency } from "../lib/currency";
import { Alert, Badge, Card, PageHeader, PageSkeleton } from "./portal-ui";

interface Data { payouts: Payout[]; upcoming: UpcomingSettlement[]; totals: { paid: Money; scheduled: Money; upcoming: Money }; settlement_days: number }

interface Props {
  /** The seller's currency. Settlements in any other currency get their own section below. */
  currency: Currency;
  title: string;
  /** Commission rate for the header, e.g. "17%". */
  rates: string;
}

/** Payouts for the signed-in seller. */
export default function PayoutsView({ currency, title, rates }: Props) {
  const [d, setD] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.payouts().then(setD).catch(err => setError(err instanceof Error ? err.message : "Could not load payouts"));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!d) return <PageSkeleton stats={3} />;

  const other = otherCurrency(currency);
  const hasOther = d.payouts.some(p => p.currency === other) || d.upcoming.some(u => u.currency === other);

  return (
    <div>
      <PageHeader title={title} sub={`Settled ${d.settlement_days} days after delivery${rates ? ` · Commission ${rates}` : ""}`} />
      <Settlements d={d} currency={currency} />
      {hasOther && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Payouts in {other}</h2>
          <Settlements d={d} currency={other} />
        </section>
      )}
    </div>
  );
}

/** Totals, upcoming settlements and history in one currency. */
function Settlements({ d: all, currency }: { d: Data; currency: Currency }) {
  const amount = (n: number | null | undefined) => formatMoney(n, currency);
  const total = (m: Money) => formatMoneyIn(m, currency);
  const d = { ...all, payouts: all.payouts.filter(p => p.currency === currency), upcoming: all.upcoming.filter(u => u.currency === currency) };

  return (
    <>
      <div className="sp-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="sp-stat sp-stat-dark"><p className="sp-stat-label">Upcoming (delivered)</p><p className="sp-stat-value">{total(d.totals.upcoming)}</p><p className="sp-stat-sub">{d.upcoming.length} order{d.upcoming.length === 1 ? "" : "s"} in the {d.settlement_days}-day window</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Scheduled</p><p className="sp-stat-value">{total(d.totals.scheduled)}</p><p className="sp-stat-sub">Settlement created, transfer pending</p></div>
        <div className="sp-stat"><p className="sp-stat-label">Paid out</p><p className="sp-stat-value" style={{ color: "#166534" }}>{total(d.totals.paid)}</p><p className="sp-stat-sub">Transferred to your bank</p></div>
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
                    <td>{amount(u.gross)}</td>
                    <td style={{ color: "#CC0000" }}>{u.commission != null ? `−${amount(u.commission)}` : "—"}{u.commission_pct != null && <span style={{ color: "#999" }}> ({u.commission_pct}%)</span>}</td>
                    <td style={{ fontWeight: 700 }}>{u.payout != null ? amount(u.payout) : "—"}</td>
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
                    <td style={{ fontWeight: 700 }}>{amount(p.amount)}</td>
                    <td style={{ color: "#CC0000" }}>{p.commission != null ? `−${amount(p.commission)}` : "—"}</td>
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
    </>
  );
}
