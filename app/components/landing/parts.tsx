"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Currency } from "@/app/lib/currency";
import { currencySymbol, formatMoney } from "@/app/lib/currency";
import { splitPrice } from "@/app/lib/rate-card";

/** Adds .in to every .nr element below it as it scrolls into view. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".nr:not(.in)") ?? [];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return <main id="main" ref={root} className="n-main">{children}</main>;
}

/** Keeps digits and one decimal point, at most 2 decimals and 9 whole digits. */
function cleanPrice(raw: string): string {
  const s = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [whole, ...rest] = s.split(".");
  const dec = rest.join("").slice(0, 2);
  return whole.slice(0, 9) + (s.includes(".") ? `.${dec}` : "");
}

export interface CalcRate { label: string; pct: number }

/** Price to payout. With more than one rate, the seller picks which one applies. */
export function Calculator({ rates, currency, defaultPrice, note }: {
  rates: CalcRate[]; currency: Currency; defaultPrice: number; note: string;
}) {
  const id = useId();
  const [price, setPrice] = useState(String(defaultPrice));
  const [picked, setPicked] = useState(0);
  const { pct, label } = rates[picked];
  const p = Number(price);
  const valid = price !== "" && Number.isFinite(p) && p > 0;
  const split = valid ? splitPrice(p, pct) : null;

  return (
    <div className="n-calc nr">
      {rates.length > 1 && (
        <div className="n-calc-pick" role="group" aria-label="Rate">
          {rates.map((r, i) => (
            <button key={r.label} type="button" aria-pressed={i === picked} onClick={() => setPicked(i)}>{r.label}</button>
          ))}
        </div>
      )}
      <div className="n-calc-field">
        <label htmlFor={id} className="n-label">Your selling price ({currency})</label>
        <div className="n-calc-input">
          <span aria-hidden>{currencySymbol(currency)}</span>
          <input id={id} type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done"
            placeholder="0" value={price} onChange={(e) => setPrice(cleanPrice(e.target.value))} />
        </div>
      </div>
      <dl className="n-calc-out" aria-live="polite">
        <div><dt>Selling price</dt><dd>{valid ? formatMoney(p, currency) : "—"}</dd></div>
        <div><dt>Commission ({pct}%{rates.length > 1 ? ` · ${label}` : ""})</dt><dd>{split ? `− ${formatMoney(split.commission, currency)}` : "—"}</dd></div>
        <div className="n-calc-pay"><dt>You receive</dt><dd>{split ? formatMoney(split.payout, currency) : "Enter a price"}</dd></div>
      </dl>
      <p className="n-fine">{note}</p>
    </div>
  );
}

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

export function WaitlistForm({ label, note, done, market }: { label: string; note: string; done: string; market: string }) {
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
        body: JSON.stringify({ email, market }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (state === "done") return <p className="n-wl-done" role="status"><strong>Waitlist joined.</strong> {done}</p>;
  return (
    <form className="n-wl" onSubmit={submit}>
      <label htmlFor="n-wl-email" className="n-sr">Email address</label>
      <input id="n-wl-email" type="email" required autoComplete="email" inputMode="email" placeholder="you@brand.com"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="n-btn n-btn-red" disabled={state === "busy"}>{state === "busy" ? "Joining…" : label}</button>
      <p className="n-wl-note">{note}</p>
      {state === "error" && <p className="n-wl-err" role="alert">{msg}</p>}
    </form>
  );
}
