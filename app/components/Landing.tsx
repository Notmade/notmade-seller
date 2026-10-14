"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Flag, Waitlist, writeMarketCookie } from "./market";
import { CONTACT_EMAIL, LEGAL_NAME, MIN_PRODUCTS } from "../lib/seller-config";
import {
  LANDING_MARKETS, SETTLEMENT_DAYS, landingMarket, openMarketsSentence, signupHref, type MarketCode,
} from "@/src/config/markets";

type LMarket = ReturnType<typeof landingMarket>;

const PANEL_ID = "market-panel";
const INDIA = landingMarket("in");
const UAE = LANDING_MARKETS.find((m) => m.code === "ae");

const SETTLEMENT_LINE = `Settlement within ${SETTLEMENT_DAYS} days after your order is delivered, in ${LANDING_MARKETS
  .map((m) => `${m.payoutCurrency} (${m.name})`).join(" or ")}.`;

const TIMELINE = [
  { t: "Order delivered", d: "The customer receives the order." },
  { t: `${SETTLEMENT_DAYS} days`, d: "Your settlement is due within this window." },
  { t: "Settlement statement", d: "You get a statement of the orders being paid." },
  { t: "Money in your account", d: "We transfer the amount to your bank account." },
];

const STEPS = [
  { t: "Create your account", d: "Enter your email and confirm it with a one-time code. No password to remember." },
  { t: "Add your business", d: "Tell us where your business is based and upload your KYC documents." },
  { t: "Sign the agreement", d: "Read the seller agreement in your dashboard and sign it with a code sent to your email." },
  { t: "List your products", d: `Add at least ${MIN_PRODUCTS} products. We review each one before it goes live.` },
];

/** Fade and rise once when scrolled into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".lp-rv");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("lp-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("lp-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => {
      // Already on screen at load: show without animating
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("lp-in");
      else { el.classList.add("lp-hide"); io.observe(el); }
    });
    return () => io.disconnect();
  }, []);
}

function MarketToggle({ value, onChange, compact = false, hidden = false }: {
  value: MarketCode; onChange: (c: MarketCode) => void; compact?: boolean; hidden?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, LANDING_MARKETS.findIndex((m) => m.code === value));

  const onKey = (e: KeyboardEvent) => {
    const n = LANDING_MARKETS.length;
    const next = e.key === "ArrowRight" ? (index + 1) % n
      : e.key === "ArrowLeft" ? (index - 1 + n) % n
      : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(LANDING_MARKETS[next].code);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={compact ? "Selling in (header)" : "Selling in"} onKeyDown={onKey}
      className={compact ? "lp-toggle lp-toggle-sm" : "lp-toggle"} aria-hidden={hidden || undefined}
      style={{ ["--n" as string]: LANDING_MARKETS.length, ["--i" as string]: index }}>
      <span className="lp-thumb" aria-hidden />
      {LANDING_MARKETS.map((m, i) => (
        <button key={m.code} ref={(el) => { refs.current[i] = el; }} type="button" role="tab"
          id={compact ? undefined : `tab-${m.code}`} aria-selected={m.code === value} aria-controls={PANEL_ID}
          tabIndex={hidden ? -1 : m.code === value ? 0 : -1} className="lp-seg"
          onClick={() => onChange(m.code)}>
          <Flag market={m} size={compact ? 12 : 16} />
          {compact
            ? <><span className="lp-seg-long">{m.name}</span><span className="lp-seg-short" aria-hidden>{m.landing.short}</span></>
            : <span>{m.name}</span>}
          {compact && <span className="s-sr">{m.name}</span>}
        </button>
      ))}
    </div>
  );
}

function PrimaryCta({ market, large = true }: { market: LMarket; large?: boolean }) {
  return market.open
    ? <a href={signupHref(market)} className={large ? "s-btn s-btn-red s-btn-lg" : "s-btn s-btn-red"}>Create your seller account</a>
    : <a href="#start" className={large ? "s-btn s-btn-red s-btn-lg" : "s-btn s-btn-red"}>Join the waitlist</a>;
}

function Section({ id, title, eyebrow, children, lead }: {
  id: string; title: string; eyebrow?: ReactNode; lead?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="lp-section" aria-labelledby={id}>
      <div className="lp-wrap lp-rv">
        {eyebrow && <p className="lp-eyebrow">{eyebrow}</p>}
        <h2 id={id} className="lp-h2">{title}</h2>
        {lead && <p className="lp-lead" style={{ marginTop: 16, maxWidth: 680 }}>{lead}</p>}
        {children}
      </div>
    </section>
  );
}

function CardMock({ market }: { market: LMarket }) {
  return (
    <div className="lp-mock" role="img"
      aria-label={`Illustration of three product cards on ${market.landing.storeHost}, priced in ${market.currency}`}>
      {market.landing.samplePrices.map((p, i) => (
        <div key={i} className="lp-mock-card">
          <div className="lp-mock-img" />
          <div className="lp-mock-line" style={{ width: "78%" }} />
          <div className="lp-mock-line" style={{ width: "52%", marginTop: 6 }} />
          <p className="lp-mock-price">{p}</p>
        </div>
      ))}
    </div>
  );
}

export default function Landing({ initial }: { initial: MarketCode }) {
  const [code, setCode] = useState<MarketCode>(initial);
  const [stuck, setStuck] = useState(false);
  const toggleRef = useRef<HTMLDivElement>(null);
  const market = landingMarket(code);
  const L = market.landing;

  useReveal();

  // Show the compact toggle in the header once the big one has scrolled away
  useEffect(() => {
    const el = toggleRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Back/forward between ?market= entries
  useEffect(() => {
    const onPop = () => setCode(landingMarket(new URLSearchParams(location.search).get("market")).code);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const choose = (next: MarketCode) => {
    if (next === code) return;
    setCode(next);
    writeMarketCookie(next);
    const url = new URL(window.location.href);
    url.searchParams.set("market", next);
    window.history.replaceState(window.history.state, "", url);
    document.title = landingMarket(next).landing.meta.title;
  };

  return (
    <div className="s-page lp">
      <header className="lp-header">
        <div className="lp-wrap lp-header-row">
          <a href="/" className="lp-wordmark" aria-label="NOTMADE seller home">NOTMADE <small>SELLER</small></a>
          <div className={stuck ? "lp-header-toggle lp-show" : "lp-header-toggle"}>
            <MarketToggle value={code} onChange={choose} compact hidden={!stuck} />
          </div>
          <a href="/login" className="s-btn s-btn-ghost">Log in</a>
          <span className="s-hide-sm"><PrimaryCta market={market} large={false} /></span>
        </div>
      </header>

      <main>
        <div className="lp-wrap lp-toggle-row" ref={toggleRef}>
          <MarketToggle value={code} onChange={choose} />
        </div>

        <div id={PANEL_ID} role="tabpanel" aria-labelledby={`tab-${code}`}>
          {/* HERO */}
          <section className="lp-hero">
            <div className="lp-wrap lp-hero-grid">
              <div>
                <p className="lp-badge"><Flag market={market} size={12} />{L.status}</p>
                <h1 className="lp-h1">{L.headline}</h1>
                <p className="lp-lead" style={{ marginTop: 20, maxWidth: 560 }}>{L.sub}</p>
                <div id="start" className="lp-start">
                  {market.open ? (
                    <PrimaryCta market={market} />
                  ) : (
                    <>
                      <Waitlist key={market.code} market={market} />
                      <p className="s-note" style={{ marginTop: 12 }}>{openMarketsSentence()}</p>
                    </>
                  )}
                  <p className="s-note" style={{ marginTop: 16 }}>
                    Already a seller? <a href="/login" className="lp-link">Log in</a>
                  </p>
                </div>
              </div>
              <CardMock market={market} />
            </div>
          </section>

          {/* YOUR PRICE */}
          <Section id="price" title="Your price, your store" lead="You set your own prices. NOTMADE never changes them.">
            <div className="lp-grid-3" style={{ marginTop: 40 }}>
              {L.pricePoints.map((p, i) => (
                <div key={p.t} className="lp-point">
                  <span className="lp-num">0{i + 1}</span>
                  <p className="lp-h3">{p.t}</p>
                  <p className="lp-body">{p.d}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* PATHS */}
          <Section id="paths" title={LANDING_MARKETS.map((m) => m.name).join(" or ")}
            lead="Two stores, two currencies. Here is what each path looks like.">
            <div className="lp-paths" style={{ marginTop: 40 }}>
              {LANDING_MARKETS.map((m) => {
                const on = m.code === code;
                return (
                  <div key={m.code} className={on ? "lp-path lp-path-on" : "lp-path"}>
                    <div className="lp-path-head">
                      <Flag market={m} size={18} />
                      <p className="lp-h3" style={{ margin: 0 }}>{m.name}</p>
                      {on
                        ? <span className="lp-tag">Selected</span>
                        : <button type="button" className="lp-switch-link" onClick={() => choose(m.code)}>View {m.name}</button>}
                    </div>
                    <dl className="lp-dl">
                      <div><dt>Store</dt><dd>{m.landing.storeHost}</dd></div>
                      <div><dt>Currency</dt><dd>{m.currency}</dd></div>
                      <div><dt>Delivery</dt><dd>{m.landing.delivery}</dd></div>
                      <div><dt>Documents</dt><dd><ul>{m.landing.documents.map((d) => <li key={d}>{d}</li>)}</ul></dd></div>
                      <div><dt>Payout</dt><dd>{m.landing.payout}</dd></div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* INDIA TO UAE */}
          {UAE && (
            <Section id="cross" title={`Sell from ${INDIA.name} to the ${UAE.name}`}
              eyebrow={<><Flag market={INDIA} size={12} /> to <Flag market={UAE} size={12} /> For India-based sellers</>}
              lead="Start with India. Add the UAE later from your dashboard, on the same account.">
              <ol className="lp-grid-3 lp-ol" style={{ marginTop: 40 }}>
                <li className="lp-point"><span className="lp-num">01</span><p className="lp-h3">Turn on UAE selling</p>
                  <p className="lp-body">From your dashboard, once your India account is approved.</p></li>
                <li className="lp-point"><span className="lp-num">02</span><p className="lp-h3">Set an AED price</p>
                  <p className="lp-body">A separate AED price for each product you want in the UAE.</p></li>
                <li className="lp-point"><span className="lp-num">03</span><p className="lp-h3">Sign a short addendum</p>
                  <p className="lp-body">Read it in your dashboard and sign with a code sent to your email.</p></li>
              </ol>
            </Section>
          )}

          {/* PAID IN 7 DAYS */}
          <Section id="paid" title={`Paid in ${SETTLEMENT_DAYS} days`} lead={SETTLEMENT_LINE}>
            <ol className="lp-timeline" style={{ marginTop: 48 }}>
              {TIMELINE.map((s, i) => (
                <li key={s.t}>
                  <span className={i === TIMELINE.length - 1 ? "lp-dot lp-dot-on" : "lp-dot"} aria-hidden />
                  <div>
                    <p className="lp-h3">{s.t}</p>
                    <p className="lp-body">{i === TIMELINE.length - 1 ? `We transfer the amount in ${market.payoutCurrency}.` : s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {/* HOW IT WORKS */}
          <Section id="how" title="How it works">
            <ol className="lp-grid-4 lp-ol" style={{ marginTop: 40 }}>
              {STEPS.map((s, i) => (
                <li key={s.t} className="lp-step">
                  <span className="lp-step-num">{i + 1}</span>
                  <p className="lp-h3">{s.t}</p>
                  <p className="lp-body">{s.d}</p>
                </li>
              ))}
            </ol>
          </Section>

          {/* WHAT WE HANDLE */}
          <Section id="handle" title="What we handle" lead="You make and pack the product. We take care of the rest.">
            <div className="lp-grid-3" style={{ marginTop: 40 }}>
              <div className="lp-point"><p className="lp-h3">Delivery</p>
                <p className="lp-body">{L.delivery}. You follow every order from your dashboard.</p></div>
              <div className="lp-point"><p className="lp-h3">Customer support</p>
                <p className="lp-body">Customers talk to us about their orders. We come to you only when we need something about the product.</p></div>
              <div className="lp-point"><p className="lp-h3">Returns with unboxing video</p>
                <p className="lp-body">{L.returns}</p></div>
            </div>
          </Section>

          {/* FAQ */}
          <Section id="faq" title="Questions">
            <div className="lp-faq" style={{ marginTop: 32 }}>
              {L.faq.map((f) => (
                <details key={`${code}-${f.q}`}>
                  <summary>{f.q}</summary>
                  <div className="lp-faq-a"><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </Section>

          {/* ABOUT */}
          <Section id="about" title="About NOTMADE">
            <div className="lp-about" style={{ marginTop: 24 }}>
              <p className="lp-lead">
                NOTMADE is run by {LEGAL_NAME}, a DPIIT recognised startup.
              </p>
              <div className="lp-contact">
                <p className="lp-h3">Talk to us on WhatsApp</p>
                <ul>
                  {LANDING_MARKETS.map((m) => (
                    <li key={m.code}>
                      <a href={m.landing.whatsapp.href} target="_blank" rel="noopener noreferrer">
                        <Flag market={m} size={12} /> {m.name}: {m.landing.whatsapp.display}
                      </a>
                    </li>
                  ))}
                  <li><a href={`mailto:${CONTACT_EMAIL}`}>Email: {CONTACT_EMAIL}</a></li>
                </ul>
              </div>
            </div>
          </Section>

          {/* FINAL CTA */}
          <section className="lp-cta" aria-labelledby="cta">
            <div className="lp-wrap lp-rv">
              <h2 id="cta" className="lp-h2">{market.open ? `Start selling on ${L.storeHost}` : `Be first in line for ${market.name}`}</h2>
              <p className="lp-lead" style={{ marginTop: 12 }}>
                {market.open ? "It takes a few minutes to create your account." : openMarketsSentence()}
              </p>
              <div style={{ marginTop: 28 }}><PrimaryCta market={market} /></div>
            </div>
          </section>
        </div>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <nav className="s-links" aria-label="Footer">
            <a href="/terms">Terms</a>
            <a href="/privacy-policy">Privacy</a>
            <a href="/refund-policy">Refund policy</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Support</a>
            <a href="/login">Log in</a>
          </nav>
          <p className="s-note" style={{ marginTop: 16 }}>&copy; {new Date().getFullYear()} {LEGAL_NAME}</p>
        </div>
      </footer>
    </div>
  );
}
