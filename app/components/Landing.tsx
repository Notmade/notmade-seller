"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, Waitlist, writeMarketCookie } from "./market";
import { api, type CommissionRates } from "../lib/seller-api";
import { CONTACT_EMAIL, LEGAL_NAME } from "../lib/seller-config";
import { LANDING_MARKETS, SETTLEMENT_DAYS, landingMarket, openMarketsSentence, signupHref, type MarketCode } from "@/src/config/markets";

type LMarket = ReturnType<typeof landingMarket>;
type Route = "india" | "uae_local" | "uae_from_india";

const STEPS = [
  { n: "01", t: "Sign up", d: "Your email and a one-time code. No passwords, no forms you'll forget." },
  { n: "02", t: "KYC", d: "Business details and documents, checked by our team in 2–3 working days." },
  { n: "03", t: "List", d: "Photos, sizes, colours and your price. Every listing is reviewed before it goes live." },
  { n: "04", t: "Get paid", d: `Accept, pack, mark ready. We pick up, deliver and settle you ${SETTLEMENT_DAYS} days after delivery.` },
];

/** Fade-and-rise on scroll; instant for reduced motion. */
function useReveal(dep: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".nl-rv:not(.nl-in)");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(el => el.classList.add("nl-in"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("nl-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

function useRates() {
  const [rates, setRates] = useState<CommissionRates | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api.commissionRates().then(setRates).catch(() => setFailed(true));
  }, []);
  return { rates, failed };
}

const pctOf = (rates: CommissionRates | null, r: Route) =>
  !rates ? null : r === "india" ? rates.india_pct : r === "uae_local" ? rates.uae_local_pct : rates.international_pct;

function Rate({ value, failed }: { value: number | null | undefined; failed: boolean }) {
  if (value != null) return <>{value}%</>;
  return failed ? <>—</> : <span className="nl-skel" aria-label="Loading rate" />;
}

function Toggle({ value, onChange, size = "lg" }: { value: MarketCode; onChange: (c: MarketCode) => void; size?: "lg" | "sm" }) {
  return (
    <div role="tablist" aria-label="Where do you sell?" className={`nl-toggle nl-toggle-${size}`}>
      {LANDING_MARKETS.map(m => (
        <button key={m.code} role="tab" type="button" aria-selected={m.code === value}
          className={m.code === value ? "on" : ""} onClick={() => onChange(m.code)}>
          <Flag market={m} size={size === "lg" ? 16 : 12} /><span className="nl-tname">{m.name}</span>
        </button>
      ))}
    </div>
  );
}

function Cta({ market, label = "Start selling", variant = "red" }: { market: LMarket; label?: string; variant?: "red" | "white" }) {
  const cls = variant === "red" ? "nl-btn nl-btn-red" : "nl-btn nl-btn-white";
  return market.open
    ? <a href={signupHref(market)} className={cls}>{label}<span aria-hidden>→</span></a>
    : <a href="#start" className={cls}>Join the waitlist<span aria-hidden>→</span></a>;
}

function Calculator({ market, rates, failed }: { market: LMarket; rates: CommissionRates | null; failed: boolean }) {
  const routes: { key: Route; label: string }[] = market.code === "ae"
    ? [{ key: "uae_local", label: "UAE-based seller" }, { key: "uae_from_india", label: "Shipping from India" }]
    : [{ key: "india", label: "India store" }, { key: "uae_from_india", label: "India → UAE" }];
  const [route, setRoute] = useState<Route>(routes[0].key);
  const [price, setPrice] = useState(market.code === "ae" ? "120" : "1999");
  useEffect(() => { setRoute(routes[0].key); setPrice(market.code === "ae" ? "120" : "1999"); }, [market.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const currency = route === "india" ? "INR" : "AED";
  const pct = pctOf(rates, route);
  const p = Math.max(0, Number(price.replace(/[^\d.]/g, "")) || 0);
  const commission = pct == null ? null : Math.round(p * pct) / 100;
  const payout = commission == null ? null : Math.round((p - commission) * 100) / 100;
  const fmt = (n: number | null) => n == null ? "—" : currency === "INR"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : `AED ${n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="nl-calc nl-rv">
      <div className="nl-calc-in">
        <div className="nl-seg" role="radiogroup" aria-label="Sales route">
          {routes.map(r => (
            <button key={r.key} type="button" role="radio" aria-checked={route === r.key} className={route === r.key ? "on" : ""} onClick={() => setRoute(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        <label htmlFor="nl-price" className="nl-calc-label">Your selling price</label>
        <div className="nl-price">
          <span>{currency === "INR" ? "₹" : "AED"}</span>
          <input id="nl-price" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <p className="nl-calc-fine">Commission is only charged on completed sales. No listing, joining or monthly fee.</p>
      </div>
      <div className="nl-calc-out" aria-live="polite">
        <div><span>Commission <Rate value={pct} failed={failed} /></span><strong>{commission == null ? "—" : `−${fmt(commission)}`}</strong></div>
        <div className="nl-calc-big"><span>You get</span><strong>{fmt(payout)}</strong></div>
        <p>Paid to your bank {SETTLEMENT_DAYS} days after delivery.</p>
      </div>
    </div>
  );
}

function PanelMock() {
  return (
    <div className="nl-mock" aria-hidden>
      <div className="nl-mock-bar"><span /><span /><span /><em>seller.notmade.in/dashboard</em></div>
      <div className="nl-mock-body">
        <div className="nl-mock-side">
          {["Dashboard", "Products", "Orders", "Payouts"].map((x, i) => <p key={x} className={i === 2 ? "on" : ""}>{x}</p>)}
        </div>
        <div className="nl-mock-main">
          <div className="nl-mock-tabs"><b>New 3</b><i>Accepted</i><i>Ready</i><i>Shipped</i></div>
          {[
            { r: "NM-IN-48213", p: "Oversized Box Tee · Black / L", a: "₹1,659", t: "Accept within 3h 12m" },
            { r: "NM-IN-48207", p: "Cargo Pant · Olive / 32", a: "₹2,904", t: "Accept within 5h 40m" },
          ].map(o => (
            <div key={o.r} className="nl-mock-order">
              <div className="nl-mock-thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="b">{o.r}</p><p>{o.p}</p><p className="red">{o.t}</p>
              </div>
              <div className="nl-mock-actions"><span className="ghost">Reject</span><span className="red">Accept</span></div>
            </div>
          ))}
          <div className="nl-mock-awb">
            <div><p>AWB · Delhivery</p><p className="b mono">1490 2213 0875</p></div>
            <span>Pickup scheduled</span><span className="dark">Label ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="nl-phone" aria-hidden>
      <div className="nl-phone-notch" />
      <p className="nl-phone-k">Next settlement</p>
      <p className="nl-phone-v">₹48,230</p>
      <p className="nl-phone-s">in 3 days · 21 orders</p>
      <div className="nl-phone-bars">{[40, 62, 35, 80, 58, 92, 70].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div>
      <div className="nl-phone-row"><span>Today</span><b>12 orders</b></div>
      <div className="nl-phone-row"><span>Ready for pickup</span><b>4</b></div>
      <div className="nl-phone-row"><span>Low stock</span><b className="red">2</b></div>
    </div>
  );
}

function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="nl-faq">
      {items.map((f, i) => (
        <div key={f.q} className={open === i ? "nl-faq-item open" : "nl-faq-item"}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span><span className="nl-faq-plus" aria-hidden>+</span>
          </button>
          <div className="nl-faq-a" role="region"><p>{f.a}</p></div>
        </div>
      ))}
    </div>
  );
}

export default function Landing({ initial }: { initial: MarketCode }) {
  const [code, setCode] = useState<MarketCode>(initial);
  const [scrolled, setScrolled] = useState(false);
  const market = landingMarket(code);
  const L = market.landing;
  const { rates, failed } = useRates();
  useReveal(code);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const choose = (c: MarketCode) => {
    setCode(c);
    writeMarketCookie(c);
    const url = new URL(window.location.href);
    if (c === "in") url.searchParams.delete("market"); else url.searchParams.set("market", c);
    window.history.replaceState(null, "", url.toString());
  };

  const india = market.code === "in";
  const deliveryStat = india
    ? { k: "3-hour", t: "delivery across Delhi NCR", d: "Same-day across Delhi NCR, and 3 to 5 days everywhere else in India." }
    : { k: "3–5 day", t: "delivery across the UAE", d: "Delivered across the UAE and tracked end to end from your dashboard." };
  const rateCards = useMemo(() => india
    ? [{ r: "india" as Route, t: "India store", d: "notmade.in · every order in India" }, { r: "uae_from_india" as Route, t: "India to UAE", d: "Your products on uae.notmade.in, shipped from India" }]
    : [{ r: "uae_local" as Route, t: "UAE local", d: "UAE-based sellers on uae.notmade.in" }, { r: "uae_from_india" as Route, t: "India to UAE", d: "India-based sellers selling into the UAE" }], [india]);

  return (
    <div className="nl">
      <header className={scrolled ? "nl-top scrolled" : "nl-top"}>
        <div className="nl-wrap nl-top-row">
          <a href="/" className="nl-logo" aria-label="NOTMADE seller home">NOT<span>MADE</span><small>SELLER</small></a>
          <Toggle value={code} onChange={choose} size="sm" />
          <nav className="nl-top-links">
            <a href="/login" className="nl-hide-sm">Log in</a>
            <Cta market={market} label="Start selling" />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="nl-hero">
          <div className="nl-wrap nl-hero-grid">
            <div>
              <p className="nl-kicker nl-rv"><span className="nl-live" />{L.status}</p>
              <h1 className="nl-h1 nl-rv">
                {india ? <>Your label.<br />Our <em>reach.</em></> : <>Built here.<br />Sold <em>everywhere.</em></>}
              </h1>
              <p className="nl-lead nl-rv">{L.sub}</p>
              <div className="nl-hero-cta nl-rv">
                <Cta market={market} />
                <a href="#calculator" className="nl-btn nl-btn-line">Calculate payout</a>
              </div>
              <div className="nl-hero-rates nl-rv">
                {rateCards.map(c => (
                  <div key={c.r}><strong><Rate value={pctOf(rates, c.r)} failed={failed} /></strong><span>{c.t}</span></div>
                ))}
                <div><strong>₹0</strong><span>to list</span></div>
              </div>
            </div>
            <div className="nl-hero-art nl-rv">
              <PanelMock />
              <PhoneMock />
            </div>
          </div>
        </section>

        <div className="nl-marquee" aria-hidden>
          <div className="nl-marquee-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                {(india
                  ? ["3-hour NCR delivery", "Pan-India reach", `${SETTLEMENT_DAYS}-day payout`, "Zero listing fee", "Streetwear only", "You set the price"]
                  : ["UAE-wide delivery", "AED settlements", `${SETTLEMENT_DAYS}-day payout`, "Zero listing fee", "Streetwear only", "You set the price"]
                ).map(t => <b key={t}>{t}<i>✦</i></b>)}
              </span>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <section className="nl-section">
          <div className="nl-wrap">
            <p className="nl-eyebrow nl-rv">Why NOTMADE</p>
            <h2 className="nl-h2 nl-rv">We do the heavy lifting.<br />You keep the drop coming.</h2>
            <div className="nl-pillars">
              <article className="nl-pillar nl-pillar-dark nl-rv">
                <p className="nl-pillar-k">{deliveryStat.k}</p>
                <h3>{deliveryStat.t}</h3>
                <p>{deliveryStat.d}</p>
              </article>
              <article className="nl-pillar nl-pillar-red nl-rv">
                <p className="nl-pillar-k">{SETTLEMENT_DAYS}-day</p>
                <h3>payout after delivery</h3>
                <p>Every settlement comes with a statement of the orders it covers. {L.payout}.</p>
              </article>
              <article className="nl-pillar nl-rv">
                <p className="nl-pillar-k">₹0</p>
                <h3>listing fee. Ever.</h3>
                <p>No joining fee, no monthly fee, no photoshoot charge. You pay commission only when you sell.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Commission */}
        <section className="nl-section nl-section-soft" id="calculator">
          <div className="nl-wrap">
            <p className="nl-eyebrow nl-rv">Commission</p>
            <h2 className="nl-h2 nl-rv">One rate. No surprises.</h2>
            <div className="nl-rates">
              {(india ? (["india", "uae_from_india"] as Route[]) : (["uae_local", "uae_from_india"] as Route[])).map(r => {
                const card = { india: { t: "India", d: "Orders on notmade.in" }, uae_local: { t: "UAE local", d: "UAE-based sellers on uae.notmade.in" }, uae_from_india: { t: "India to UAE", d: "India-based sellers, listed on uae.notmade.in" } }[r];
                return (
                  <div key={r} className="nl-rate nl-rv">
                    <p className="nl-rate-v"><Rate value={pctOf(rates, r)} failed={failed} /></p>
                    <p className="nl-rate-t">{card.t}</p>
                    <p className="nl-rate-d">{card.d}</p>
                  </div>
                );
              })}
            </div>
            {failed && <p className="nl-fine nl-rv">Live rates could not load right now. Your exact rate is shown in your agreement before you sign.</p>}
            <Calculator market={market} rates={rates} failed={failed} />
          </div>
        </section>

        {/* How it works */}
        <section className="nl-section">
          <div className="nl-wrap">
            <p className="nl-eyebrow nl-rv">How it works</p>
            <h2 className="nl-h2 nl-rv">Four steps to your first order.</h2>
            <ol className="nl-steps">
              {STEPS.map(s => (
                <li key={s.n} className="nl-step nl-rv">
                  <span className="nl-step-n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Panel */}
        <section className="nl-section nl-section-black">
          <div className="nl-wrap nl-panel-grid">
            <div>
              <p className="nl-eyebrow nl-rv" style={{ color: "#FF6B61" }}>The seller panel</p>
              <h2 className="nl-h2 nl-rv">Run it all from<br />one screen.</h2>
              <ul className="nl-ticks">
                {[
                  "Accept or reject every order, with a clear accept timer",
                  "Mark as ready — we generate the AWB and book the pickup",
                  "Download the label, follow pickup to delivery live",
                  "Commission and payout shown on every single order",
                  "Low stock, returns and settlements at a glance",
                ].map(t => <li key={t} className="nl-rv">{t}</li>)}
              </ul>
            </div>
            <div className="nl-rv"><PanelMock /></div>
          </div>
        </section>

        {/* FAQ */}
        <section className="nl-section">
          <div className="nl-wrap nl-faq-grid">
            <div>
              <p className="nl-eyebrow nl-rv">FAQ</p>
              <h2 className="nl-h2 nl-rv">Questions,<br />answered.</h2>
              <p className="nl-body nl-rv">Something else? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or WhatsApp <a href={L.whatsapp.href} target="_blank" rel="noopener noreferrer">{L.whatsapp.display}</a>.</p>
            </div>
            <div className="nl-rv"><Faq items={L.faq} /></div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="nl-final" id="start">
          <div className="nl-wrap">
            <h2 className="nl-final-h nl-rv">Drop it on<br /><span>NOTMADE.</span></h2>
            <p className="nl-lead nl-rv" style={{ color: "rgba(255,255,255,.75)", maxWidth: 560 }}>
              {market.open ? `Open your ${market.name} seller account in minutes. Listing is free.` : openMarketsSentence()}
            </p>
            <div className="nl-rv" style={{ marginTop: 28 }}>
              {market.open ? <Cta market={market} variant="white" /> : <div className="nl-waitlist"><Waitlist market={market} /></div>}
            </div>
          </div>
        </section>

        <div className="nl-trust">
          <div className="nl-wrap nl-trust-row">
            <span className="nl-trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
              DPIIT recognised startup
            </span>
            <span>{LEGAL_NAME}</span>
            <span><Flag market={market} size={12} /> {L.storeHost}</span>
          </div>
        </div>
      </main>

      <footer className="nl-foot">
        <div className="nl-wrap nl-foot-row">
          <span>© {new Date().getFullYear()} {LEGAL_NAME}</span>
          <nav>
            <a href="/terms">Terms</a><a href="/privacy-policy">Privacy</a><a href="/refund-policy">Refunds</a><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
