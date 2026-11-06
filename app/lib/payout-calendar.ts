// Payouts laid out by date. Days are the seller's own store-local days.
import { dayKey } from "./insights";
import type { Payout, UpcomingSettlement } from "./seller-api";

export type PayoutState = "pending" | "paid";
export interface PayoutEvent { id: string; date: string; state: PayoutState; amount: number | null; label: string }

/** Everything with a date, newest first. Orders awaiting a settlement record and scheduled settlements both count as pending. */
export function payoutEvents(payouts: Payout[], upcoming: UpcomingSettlement[], timeZone: string): PayoutEvent[] {
  const out: PayoutEvent[] = [];
  for (const u of upcoming) out.push({ id: `order-${u.ref_no}`, date: dayKey(u.settlement_date, timeZone), state: "pending", amount: u.payout, label: u.ref_no });
  for (const p of payouts) {
    const when = p.status === "paid" ? p.paid_at ?? p.due_date ?? p.created_at : p.due_date ?? p.created_at;
    out.push({ id: `payout-${p.id}`, date: dayKey(when, timeZone), state: p.status === "paid" ? "paid" : "pending", amount: p.amount, label: p.reference || "Settlement" });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export interface CalendarDay { date: string; day: number; events: PayoutEvent[] }

/** The weeks of a month, Monday first, with null in the cells outside it. `month` is 0-based. */
export function monthGrid(year: number, month: number, events: PayoutEvent[]): (CalendarDay | null)[][] {
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: (CalendarDay | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: d, events: events.filter((e) => e.date === date) });
  }
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}
