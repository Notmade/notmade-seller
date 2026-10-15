"use client";

import { useEffect, useRef, useState } from "react";
import type { CommissionRates } from "../../lib/seller-api";
import type { Counter as CounterSpec, IconName, ModeContent, RateKey, Step } from "@/app/landing/content/types";
import { reducedMotion, useInView } from "./hooks";

/* ── live rate ── */

export function Rate({ rates, k, failed }: { rates: CommissionRates | null; k: RateKey; failed: boolean }) {
  const v = rates?.[k];
  if (v != null) return <>{v}%</>;
  return failed ? <span title="Shown in your agreement">—</span> : <span className="l-skel" aria-label="Loading live rate" />;
}

/* ── count-up for published facts (hours, days) ── */

function useCount(to: number, run: boolean) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!run || reducedMotion()) { setN(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return n;
}

export function Counter({ c, className }: { c: CounterSpec; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.6);
  const a = useCount(c.from ?? c.to, seen);
  const b = useCount(c.to, seen);
  const digits = String(c.to).length + (c.from != null ? String(c.from).length + 1 : 0);
  return (
    <span ref={ref} className={`l-count ${className ?? ""}`} aria-label={`${c.from != null ? `${c.from} to ` : ""}${c.to} ${c.unit}`}>
      <span aria-hidden style={{ minWidth: `${digits}ch` }} className="l-count-n">{c.from != null ? <>{a}–{b}</> : b}</span>
      <span aria-hidden className="l-count-u">{c.unit}</span>
    </span>
  );
}

/* ── magnetic CTA ── */

export function Magnetic({ href, children, variant = "red", onClick }: {
  href: string; children: React.ReactNode; variant?: "red" | "white" | "line" | "ink"; onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <a ref={ref} href={href} onClick={onClick} onPointerMove={move} onPointerLeave={leave} className={`l-btn l-btn-${variant}`}>
      <span>{children}</span><span aria-hidden className="l-btn-arrow">→</span>
    </a>
  );
}

/* ── step timeline that draws as you scroll ── */

export function Timeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) { el.style.setProperty("--p", "1"); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(4));
      el.querySelectorAll<HTMLElement>(".l-tl-step").forEach((s) => {
        s.classList.toggle("on", s.getBoundingClientRect().top < window.innerHeight * 0.65);
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [steps]);

  return (
    <ol ref={ref} className="l-tl">
      <span className="l-tl-rail" aria-hidden><span className="l-tl-fill" /></span>
      {steps.map((s, i) => (
        <li key={s.title} className="l-tl-step">
          <span className="l-tl-dot" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
          <div className="l-tl-card">
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {(s.needs?.length || s.turnaround) && (
              <div className="l-tl-meta">
                {s.needs?.length ? (
                  <div><span className="l-mono">You need</span><ul>{s.needs.map((n) => <li key={n}>{n}</li>)}</ul></div>
                ) : null}
                {s.turnaround && <div><span className="l-mono">Turnaround</span><p className="l-tl-turn">{s.turnaround}</p></div>}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── order-day lanes ── */

export function Lanes({ lanes }: { lanes: ModeContent["orderDay"]["lanes"] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className={seen ? "l-lanes go" : "l-lanes"}>
      {lanes.map((l, li) => (
        <div key={l.title} className="l-lane" style={{ "--d": `${li * 0.35}s` } as React.CSSProperties}>
          <div className="l-lane-head">
            <h3>{l.title}</h3>
            <div className="l-lane-tags">
              {l.badge && <span className="l-tag">{l.badge}</span>}
              {l.counter && <span className="l-tag l-tag-red"><Counter c={l.counter} /></span>}
            </div>
          </div>
          <div className="l-lane-track">
            <span className="l-lane-line" aria-hidden><span /></span>
            <span className="l-lane-runner" aria-hidden />
            <ol>
              {l.stops.map((s, i) => (
                <li key={s} style={{ "--i": i } as React.CSSProperties}><span className="l-lane-pin" aria-hidden />{s}</li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── commission calculator ── */

export function Calculator({ c, rates, failed }: { c: ModeContent["commission"]; rates: CommissionRates | null; failed: boolean }) {
  const [ri, setRi] = useState(0);
  const [price, setPrice] = useState(String(c.defaultPrice ?? ""));
  const route = c.routes[Math.min(ri, c.routes.length - 1)];
  const pct = rates?.[route.rate] ?? null;

  const seg = c.routes.length > 1 && (
    <div className="l-seg" role="radiogroup" aria-label="Store">
      {c.routes.map((r, i) => (
        <button key={r.label} type="button" role="radio" aria-checked={i === ri} className={i === ri ? "on" : ""} onClick={() => setRi(i)}>{r.label}</button>
      ))}
      <span className="l-seg-pill" style={{ width: `calc((100% - 8px) / ${c.routes.length})`, transform: `translateX(${ri * 100}%)` }} aria-hidden />
    </div>
  );

  if (c.kind === "split") {
    const keep = pct == null ? null : 100 - pct;
    return (
      <div className="l-calc lr">
        <div className="l-calc-in">
          {seg}
          <p className="l-mono" style={{ marginTop: seg ? 22 : 0 }}>{route.hint}</p>
          <div className="l-split" aria-live="polite">
            <div className="l-split-bar" role="img" aria-label={pct == null ? "Loading split" : `You receive ${keep}%, commission ${pct}%`}>
              <span className="l-split-you" style={{ width: `${keep ?? 50}%` }}><b>{keep == null ? "" : `${keep}%`}</b></span>
              <span className="l-split-nm" style={{ width: `${pct ?? 50}%` }}><b>{pct == null ? "" : `${pct}%`}</b></span>
            </div>
            <div className="l-split-legend">
              <span><i className="you" />You receive</span>
              <span><i className="nm" />NOTMADE commission · <Rate rates={rates} k={route.rate} failed={failed} /></span>
            </div>
          </div>
          <p className="l-calc-big">
            {keep == null ? (failed ? "Your rate is shown in your agreement." : <span className="l-skel l-skel-w" />) : <>Out of every 100 in price, you receive <strong>{keep}</strong>.</>}
          </p>
        </div>
        <p className="l-fine">{c.note}</p>
      </div>
    );
  }

  const p = Math.max(0, Number(price.replace(/[^\d.]/g, "")) || 0);
  const commission = pct == null ? null : Math.round(p * pct) / 100;
  const payout = commission == null ? null : Math.round((p - commission) * 100) / 100;
  const fmt = (n: number | null) => n == null ? "—" : `${c.currencySymbol ?? ""}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <div className="l-calc l-calc-amount lr">
      <div className="l-calc-in">
        {seg}
        <label htmlFor="l-price" className="l-mono">Your selling price</label>
        <div className="l-price">
          {c.currencySymbol && <span>{c.currencySymbol}</span>}
          <input id="l-price" inputMode="decimal" autoComplete="off" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <p className="l-mono" style={{ marginTop: 12 }}>{route.hint}</p>
      </div>
      <div className="l-calc-out" aria-live="polite">
        <div><span>Commission · <Rate rates={rates} k={route.rate} failed={failed} /></span><strong>{commission == null ? "—" : `−${fmt(commission)}`}</strong></div>
        <div className="l-split-bar l-split-mini" aria-hidden>
          <span className="l-split-you" style={{ width: `${pct == null ? 50 : 100 - pct}%` }} />
          <span className="l-split-nm" style={{ width: `${pct ?? 50}%` }} />
        </div>
        <div className="l-calc-pay"><span>You receive</span><strong>{payout == null ? (failed ? "See agreement" : "—") : fmt(payout)}</strong></div>
      </div>
      <p className="l-fine">{c.note}</p>
    </div>
  );
}

/* ── India seller → NOTMADE → UAE customer ── */

export function FlowDiagram({ flow }: { flow: NonNullable<ModeContent["flow"]> }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={seen ? "l-flow go" : "l-flow"}>
      {flow.nodes.map((n, i) => (
        <div key={n.title} className="l-flow-cell">
          <div className={i === 1 ? "l-flow-node mid" : "l-flow-node"} style={{ "--i": i } as React.CSSProperties}>
            <span className="l-mono">{n.label}</span>
            <h3>{n.title}</h3>
            <ul>{n.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          {i < flow.nodes.length - 1 && (
            <div className="l-flow-link" aria-hidden style={{ "--i": i } as React.CSSProperties}>
              <span className="l-flow-wire" /><span className="l-flow-parcel" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── feature icons (inline, no assets) ── */

const ICONS: Record<IconName, string> = {
  dashboard: "M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z",
  orders: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5",
  variants: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16.5 13v7M13 16.5h7",
  label: "M3 6h18v12H3zM6 9v6M9 9v6M11 9v6M14 9v6M17 9v6",
  bell: "M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0",
  payout: "M3 7h18v12H3zM3 11h18M7 15h4",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
  store: "M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-6h6v6",
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ── FAQ ── */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="l-faq">
      {items.map((f, i) => (
        <div key={f.q} className={open === i ? "l-faq-item open" : "l-faq-item"}>
          <h3>
            <button type="button" id={`faq-q-${i}`} aria-controls={`faq-a-${i}`} aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span><span className="l-faq-plus" aria-hidden />
            </button>
          </h3>
          <div className="l-faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><div><p>{f.a}</p></div></div>
        </div>
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
    return (
      <div className="l-wl-done" role="status">
        <span className="l-wl-tick" aria-hidden>✓</span>
        <div><strong>Waitlist joined</strong><p>{waitlist.done}</p><p className="l-wl-email">{email}</p></div>
      </div>
    );
  }
  return (
    <form className="l-wl" onSubmit={submit}>
      <label htmlFor="l-wl-email" className="l-sr">Email address</label>
      <input id="l-wl-email" type="email" required autoComplete="email" placeholder="you@brand.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="l-btn l-btn-red" disabled={state === "busy"}>
        <span>{state === "busy" ? "Joining…" : waitlist.label}</span><span aria-hidden className="l-btn-arrow">→</span>
      </button>
      <p className="l-wl-note">{waitlist.note}</p>
      {state === "error" && <p className="l-wl-err" role="alert">{msg}</p>}
    </form>
  );
}
