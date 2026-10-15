"use client";

import { useId, useState } from "react";
import type { ModeContent } from "@/app/landing/content/types";
import type { RatesState } from "./hooks";

/* ── commission calculator ── */

type Calc = ModeContent["money"]["calc"];

/** Keeps digits and one decimal point, at most 2 decimals and 9 whole digits. */
function cleanPrice(raw: string): string {
  const s = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [whole, ...rest] = s.split(".");
  const dec = rest.join("").slice(0, 2);
  return whole.slice(0, 9) + (s.includes(".") ? `.${dec}` : "");
}

export function formatMoney(n: number, currency: Calc["currency"]): string {
  return currency === "INR"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : `AED ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function Calculator({ calc, rates }: { calc: Calc; rates: RatesState }) {
  const id = useId();
  const [price, setPrice] = useState(calc.defaultPrice != null ? String(calc.defaultPrice) : "");
  const pct = rates.rates[calc.rate];
  const p = Number(price);
  const valid = price !== "" && Number.isFinite(p) && p > 0;
  const commission = valid && pct != null ? Math.round(p * pct) / 100 : null;
  const payout = commission != null ? Math.round((p - commission) * 100) / 100 : null;

  const rateText = rates.loading ? "Loading live rate…"
    : pct == null ? "Rate shared during onboarding"
    : rates.live[calc.rate] ? `${pct}% · live rate` : `${pct}% · indicative, live rate unavailable`;

  return (
    <div className="n-calc nr">
      <div className="n-calc-field">
        <label htmlFor={id} className="n-label">Your selling price ({calc.currency})</label>
        <div className="n-calc-input">
          <span aria-hidden>{calc.currency === "INR" ? "₹" : "AED"}</span>
          <input id={id} type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done"
            placeholder="0" value={price} onChange={(e) => setPrice(cleanPrice(e.target.value))} />
        </div>
        <p className="n-calc-rate" aria-live="polite">
          <span className={rates.loading ? "n-dot n-dot-wait" : rates.live[calc.rate] ? "n-dot n-dot-live" : "n-dot"} aria-hidden />
          Commission: {rateText}
        </p>
      </div>

      <dl className="n-calc-out" aria-live="polite">
        <div><dt>Selling price</dt><dd>{valid ? formatMoney(p, calc.currency) : "—"}</dd></div>
        <div><dt>Commission{pct != null ? ` (${pct}%)` : ""}</dt><dd>{commission != null ? `− ${formatMoney(commission, calc.currency)}` : "—"}</dd></div>
        <div className="n-calc-pay"><dt>You receive</dt><dd>{payout != null ? formatMoney(payout, calc.currency) : pct == null && !rates.loading ? "In your agreement" : !valid ? "Enter a price" : "—"}</dd></div>
      </dl>
      <p className="n-fine">{calc.note}</p>
    </div>
  );
}

/* ── FAQ ── */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="n-faq">
      {items.map((f) => (
        <details key={f.q} className="n-faq-item">
          <summary><span>{f.q}</span><span className="n-faq-plus" aria-hidden /></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ── UAE seller waitlist while UAE sign-up is closed ── */

export function WaitlistForm({ waitlist }: { waitlist: NonNullable<ModeContent["signup"]["waitlist"]> }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, market: waitlist.waitlistMarket }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (state === "done") {
    return <p className="n-wl-done" role="status"><strong>Waitlist joined.</strong> {waitlist.done}</p>;
  }
  return (
    <form className="n-wl" onSubmit={submit}>
      <label htmlFor="n-wl-email" className="n-sr">Email address</label>
      <input id="n-wl-email" type="email" required autoComplete="email" inputMode="email" placeholder="you@brand.com"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="n-btn n-btn-red" disabled={state === "busy"}>
        {state === "busy" ? "Joining…" : waitlist.label}
      </button>
      <p className="n-wl-note">{waitlist.note}</p>
      {state === "error" && <p className="n-wl-err" role="alert">{msg}</p>}
    </form>
  );
}
