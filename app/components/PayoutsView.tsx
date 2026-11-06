"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, fmtDate, type Payout, type UpcomingSettlement, type Money } from "../lib/seller-api";
import { formatMoney, formatMoneyIn, otherCurrency, type Currency } from "../lib/currency";
import { monthGrid, payoutEvents, type PayoutEvent } from "../lib/payout-calendar";
import { useDashboardSeller, useSellerCurrency } from "../dashboard/seller-context";
import { Alert, Badge, Button, Card, EmptyState, PageHeader, PageSkeleton } from "./portal-ui";

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
  const seller = useDashboardSeller();
  const { country } = useSellerCurrency();
  // The backend keeps a bank destination only for UAE sellers (IBAN); see "Backend gaps" in the README
  const bankMissing = country === "AE" && !seller.iban;

  useEffect(() => {
    api.payouts().then(setD).catch(err => setError(err instanceof Error ? err.message : "Could not load payouts"));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!d) return <PageSkeleton stats={3} />;

  const other = otherCurrency(currency);
  const hasOther = d.payouts.some(p => p.currency === other) || d.upcoming.some(u => u.currency === other);

  return (
    <div>
      <PageHeader title={title} sub={`Settlement within ${d.settlement_days} days${rates ? ` · Commission ${rates}` : ""}`} />
      {bankMissing && (
        <div style={{ marginBottom: 14 }}>
          <Alert kind="warn"><strong>Add your bank details.</strong> We need your IBAN to pay your settlements. <Link href="/dashboard/profile" style={{ color: "#CC0000", fontWeight: 700 }}>Go to Profile</Link></Alert>
        </div>
      )}
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

      <PayoutCalendar payouts={d.payouts} upcoming={d.upcoming} currency={currency} />

      <Card style={{ padding: 0, marginBottom: 16 }}>
        <div className="sp-card-head"><h2>Upcoming settlements</h2></div>
        {d.upcoming.length === 0 ? (
          <EmptyState title="Nothing pending" sub="Delivered orders show here with their settlement date." action={<Link href="/dashboard/orders" className="sp-btn-line">See your orders</Link>} />
        ) : (
          <div className="sp-scroll" tabIndex={0} role="region" aria-label="Settlements">
            <table className="sp-table sp-stacked">
              <thead><tr><th scope="col">Order</th><th scope="col">Order value</th><th scope="col">Commission</th><th scope="col">You get</th><th scope="col">Settles on</th></tr></thead>
              <tbody>
                {d.upcoming.map(u => (
                  <tr key={u.ref_no}>
                    <td data-label="Order" style={{ fontWeight: 700 }}>{u.ref_no}</td>
                    <td data-label="Order value">{amount(u.gross)}</td>
                    <td data-label="Commission" style={{ color: "#CC0000" }}><span>{u.commission != null ? `−${amount(u.commission)}` : "—"}{u.commission_pct != null && <span style={{ color: "#999" }}> ({u.commission_pct}%)</span>}</span></td>
                    <td data-label="You get" style={{ fontWeight: 700 }}>{u.payout != null ? amount(u.payout) : "—"}</td>
                    <td data-label="Settles on">{fmtDate(u.settlement_date)}</td>
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
          <EmptyState title="No settlements yet" sub="Your first settlement shows here once it is paid." />
        ) : (
          <div className="sp-scroll" tabIndex={0} role="region" aria-label="Settlements">
            <table className="sp-table sp-stacked">
              <thead><tr><th scope="col">Created</th><th scope="col">Amount</th><th scope="col">Commission</th><th scope="col">Due / paid</th><th scope="col">Status</th><th scope="col">Reference</th><th scope="col">Statement</th></tr></thead>
              <tbody>
                {d.payouts.map(p => (
                  <tr key={p.id}>
                    <td data-label="Created">{fmtDate(p.created_at)}</td>
                    <td data-label="Amount" style={{ fontWeight: 700 }}>{amount(p.amount)}</td>
                    <td data-label="Commission" style={{ color: "#CC0000" }}>{p.commission != null ? `−${amount(p.commission)}` : "—"}</td>
                    <td data-label="Due / paid">{fmtDate(p.paid_at || p.due_date)}</td>
                    <td data-label="Status"><Badge status={p.status === "paid" ? "approved" : "pending"} label={p.status === "paid" ? "Paid" : "Scheduled"} /></td>
                    <td data-label="Reference" style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12 }}>{p.reference || "—"}</td>
                    <td data-label="Statement">{p.invoice_url ? <a href={p.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: "#CC0000", fontWeight: 600 }}>Download</a> : "—"}</td>
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

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** A month of settlements, with the chosen day's items listed below. Pending and paid are told apart by label too, not only by colour. */
function PayoutCalendar({ payouts, upcoming, currency }: { payouts: Payout[]; upcoming: UpcomingSettlement[]; currency: Currency }) {
  const { timeZone } = useSellerCurrency();
  const events = useMemo(() => payoutEvents(payouts, upcoming, timeZone), [payouts, upcoming, timeZone]);
  const first = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone });
    const on = events.find((e) => e.state === "pending" && e.date >= today)?.date ?? events[0]?.date ?? today;
    return { y: Number(on.slice(0, 4)), m: Number(on.slice(5, 7)) - 1 };
  }, [events, timeZone]);
  const [at, setAt] = useState(first);
  const [day, setDay] = useState<string | null>(null);
  const weeks = monthGrid(at.y, at.m, events);
  const shift = (by: number) => { const d = new Date(Date.UTC(at.y, at.m + by, 1)); setAt({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); setDay(null); };
  const inMonth = events.filter((e) => e.date.startsWith(`${at.y}-${String(at.m + 1).padStart(2, "0")}`) && (!day || e.date === day));
  const line = (e: PayoutEvent) => (
    <li key={e.id}><span>{e.date.slice(8)} · {e.label}</span><strong>{e.amount != null ? formatMoney(e.amount, currency) : "—"}</strong><Badge status={e.state === "paid" ? "approved" : "pending"} label={e.state === "paid" ? "Paid" : "Pending"} /></li>
  );

  return (
    <Card style={{ padding: 0, marginBottom: 16 }}>
      <div className="sp-card-head sp-cal-head">
        <h2>Payout calendar</h2>
        <div className="sp-inline" style={{ alignItems: "center" }}>
          <Button variant="secondary" aria-label="Previous month" onClick={() => shift(-1)}>←</Button>
          <span className="sp-cal-month" aria-live="polite">{MONTH.format(Date.UTC(at.y, at.m, 1))}</span>
          <Button variant="secondary" aria-label="Next month" onClick={() => shift(1)}>→</Button>
        </div>
      </div>
      <div className="sp-scroll">
        <table className="sp-cal" aria-label="Settlements by day">
          <thead><tr>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
          <tbody>
            {weeks.map((w, i) => (
              <tr key={i}>
                {w.map((c, j) => (
                  <td key={j}>
                    {c && (c.events.length ? (
                      <button type="button" aria-pressed={day === c.date} onClick={() => setDay(day === c.date ? null : c.date)}
                        aria-label={`${c.day}: ${c.events.filter((e) => e.state === "pending").length} pending, ${c.events.filter((e) => e.state === "paid").length} paid`}>
                        {c.day}
                        <i>{c.events.some((e) => e.state === "pending") && <b className="pending" />}{c.events.some((e) => e.state === "paid") && <b className="paid" />}</i>
                      </button>
                    ) : <span>{c.day}</span>)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {inMonth.length > 0
        ? <ul className="sp-cal-list">{inMonth.map(line)}</ul>
        : <p className="sp-cal-empty">No settlements this month.</p>}
    </Card>
  );
}
