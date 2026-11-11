// The commission on the chosen category, in words. Every number comes from GET /seller/bulk/template, which works it out
// with the same code that prices the seller's orders. Nothing here holds a rate.
import type { BulkCommission } from "./seller-api";

const pct = (n: number | null) => (n == null ? null : `${n}%`);

export interface CommissionView {
  /** The rate, or null when there is a who-ships choice (then read `options`). */
  headline: string | null;
  options: { mode: string; title: string; detail: string | null }[];
  notes: string[];
}

export function commissionView(c: BulkCommission): CommissionView {
  const notes: string[] = [];
  if (c.status === "pending_approval") notes.push("These rates apply once NOTMADE approves your account.");
  if (c.status === "legacy") notes.push("Your agreement has one rate for every category.");
  else notes.push(`${c.group_label}${c.mapped ? "" : " rate"}, from your rate card ${c.terms_version}.`);
  if (c.source === "override") notes.push("This is a rate NOTMADE set for your account.");
  if (c.shipping_included) notes.push("Shipping is included.");
  if (c.settlement_days) notes.push(`Settlement within ${c.settlement_days} days.`);

  if (c.who_ships && c.who_ships.options.length) {
    const options = c.who_ships.options.map((o) => ({
      mode: o.fulfilment_mode,
      title: `${o.label}: ${pct(o.pct) ?? "see your agreement"}`,
      detail: o.shipping_charge_pct ? `${o.commission_pct}% commission + ${o.shipping_charge_pct}% NOTMADE shipping charge, flat, no VAT added` : null,
    }));
    if (!c.who_ships.sets_rate) notes.unshift("Who ships does not change the rate.");
    return { headline: c.who_ships.sets_rate ? null : pct(c.pct), options, notes };
  }
  return { headline: pct(c.pct), options: [], notes };
}
