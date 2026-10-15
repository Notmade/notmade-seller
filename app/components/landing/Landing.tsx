"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./landing.css";
import { MODES, getMode, type ModeCode, type ModeContent } from "@/app/landing/content";
import { CONTACT_EMAIL, DPIIT_NUMBER, LEGAL_NAME, SETTLEMENT_DAYS_AFTER_DELIVERY } from "../../lib/seller-config";
import { writeMarketCookie } from "../market";
import { reducedMotion, useActiveSection, useRates, useReveal } from "./hooks";
import { Calculator, Counter, Faq, FlowDiagram, Icon, Lanes, Magnetic, Rate, Timeline, WaitlistForm } from "./parts";

type Props = { initial: ModeCode; uaeSignupOpen: boolean };

function sectionsFor(m: ModeContent) {
  return [
    { id: "why", label: "Why NOTMADE" },
    ...(m.flow ? [{ id: "flow", label: "Flow" }] : []),
    { id: "how", label: "How it works" },
    { id: "order-day", label: "Order day" },
    { id: "commission", label: "Commission" },
    { id: "features", label: "What you get" },
    { id: "documents", label: "Documents" },
    { id: "faq", label: "FAQ" },
  ];
}

function ModeSwitcher({ value, onChange, size }: { value: ModeCode; onChange: (c: ModeCode) => void; size: "lg" | "sm" }) {
  const i = MODES.findIndex((m) => m.code === value);
  return (
    <div role="tablist" aria-label="Where do you sell?" className={`l-switch l-switch-${size}`}>
      <span className="l-switch-pill" style={{ transform: `translateX(${i * 100}%)` }} aria-hidden />
      {MODES.map((m) => (
        <button key={m.code} type="button" role="tab" aria-selected={m.code === value} className={m.code === value ? "on" : ""} onClick={() => onChange(m.code)}>
          {size === "sm" ? <><span className="l-hide-sm">{m.tab.label}</span><span className="l-show-sm">{m.tab.short}</span></> : m.tab.label}
        </button>
      ))}
    </div>
  );
}

/** Order card illustration. Words only, no figures. */
function HeroVisual({ mode }: { mode: ModeContent }) {
  const store = mode.code === "in" ? "notmade.in" : "uae.notmade.in";
  const stages = mode.code === "ae" ? ["New", "Accepted", "Ready", "Delivered"] : ["New", "Accepted", "Ready", mode.code === "in" ? "Shipped" : "Handed over"];
  return (
    <div className="l-hv" aria-hidden>
      <div className="l-hv-card">
        <div className="l-hv-top"><span className="l-hv-store">{store}</span><span className="l-hv-new">New order</span></div>
        <div className="l-hv-item">
          <div className="l-hv-thumb" />
          <div className="l-hv-lines"><i /><i /><i className="s" /></div>
        </div>
        <div className="l-hv-stages">{stages.map((s, i) => <span key={s} style={{ "--i": i } as React.CSSProperties}>{s}</span>)}</div>
        <div className="l-hv-actions"><span className="ghost">Reject</span><span className="red">Accept</span></div>
      </div>
      <div className="l-hv-chip l-hv-chip-a">{mode.code === "global" ? "Sell in UAE · On" : "Cash on delivery"}</div>
      <div className="l-hv-chip l-hv-chip-b">Payout · {SETTLEMENT_DAYS_AFTER_DELIVERY} days after delivery</div>
    </div>
  );
}

export default function Landing({ initial, uaeSignupOpen }: Props) {
  const [code, setCode] = useState<ModeCode>(initial);
  const [scrolled, setScrolled] = useState(false);
  const mode = getMode(code);
  const { rates, failed } = useRates();
  const mainRef = useRef<HTMLElement>(null);
  useReveal(mainRef, code);

  const sections = useMemo(() => sectionsFor(mode), [mode]);
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const active = useActiveSection(ids, code);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Back/forward between modes
  useEffect(() => {
    const pop = () => setCode(getMode(new URL(window.location.href).searchParams.get("market")).code);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  const choose = (next: ModeCode) => {
    if (next === code) return;
    setCode(next);
    if (next !== "global") writeMarketCookie(next);
    const url = new URL(window.location.href);
    url.searchParams.set("market", next);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    if (window.scrollY > 600) window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const waitlist = mode.code === "ae" && !uaeSignupOpen ? mode.signup.waitlist : undefined;
  const primary = waitlist ? { label: waitlist.label, href: "#start" } : { label: mode.signup.label, href: mode.signup.href };

  return (
    <div className="l" data-mode={code}>
      <header className={scrolled ? "l-top scrolled" : "l-top"}>
        <div className="l-wrap l-top-row">
          <a href={`/?market=${code}`} className="l-logo" aria-label="NOTMADE seller home">NOT<span>MADE</span><small>Seller</small></a>
          <ModeSwitcher value={code} onChange={choose} size="sm" />
          <nav className="l-top-links" aria-label="Account">
            <a href={mode.login.href} className="l-hide-sm l-top-login">{mode.login.label}</a>
            <a href={primary.href} className="l-btn l-btn-red l-btn-sm"><span>{primary.label}</span></a>
          </nav>
        </div>
        <nav className="l-snav" aria-label="Sections">
          <div className="l-wrap l-snav-row">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""} aria-current={active === s.id ? "true" : undefined}>{s.label}</a>
            ))}
          </div>
        </nav>
      </header>

      <main ref={mainRef} key={code} className="l-main">
        {/* Hero */}
        <section className="l-hero" id="top">
          <div className="l-wrap">
            <div className="l-hero-switch lh"><ModeSwitcher value={code} onChange={choose} size="lg" /></div>
            <div className="l-hero-grid">
              <div>
                <p className="l-kicker lh"><span className="l-live" />{mode.hero.kicker}</p>
                <h1 className={mode.hero.headline.join(" ").length > 26 ? "l-h1 long lh" : "l-h1 lh"}>
                  {mode.hero.headline.map((line, i) => (
                    <span key={line} className={i === mode.hero.headline.length - 1 ? "red" : ""}>{line}</span>
                  ))}
                </h1>
                <p className="l-lead lh">{mode.hero.sub}</p>
                <div className="l-hero-cta lh">
                  <Magnetic href={primary.href}>{primary.label}</Magnetic>
                  <a href="#how" className="l-btn l-btn-line"><span>How it works</span></a>
                </div>
                <dl className="l-stats lh">
                  {mode.hero.stats.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.counter ? <Counter c={s.counter} /> : s.rate ? <span className="l-count-n"><Rate rates={rates} k={s.rate} failed={failed} /></span> : <span className="l-count-n">{s.text}</span>}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="lh"><HeroVisual mode={mode} /></div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <div className="l-trust">
          <div className="l-wrap l-trust-row">
            <span className="l-trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
              DPIIT recognised startup · {DPIIT_NUMBER}
            </span>
            <span>{LEGAL_NAME}</span>
            {mode.trust.slice(1).map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>

        <div className="l-marquee" aria-hidden>
          <div className="l-marquee-track">
            {[0, 1].map((k) => (
              <span key={k}>{mode.marquee.map((t) => <b key={t}>{t}<i>✦</i></b>)}</span>
            ))}
          </div>
        </div>

        {/* Why */}
        <section className="l-sec" id="why">
          <div className="l-wrap">
            <p className="l-eyebrow lr">Why NOTMADE</p>
            <h2 className="l-h2 lr">{mode.why.title}</h2>
            <div className="l-why">
              {mode.why.items.map((w, i) => (
                <article key={w.title} className={`l-why-card lr ${i === 0 ? "ink" : i === 2 ? "red" : ""}`} style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                  <p className="l-why-k">{w.counter ? <Counter c={w.counter} /> : w.kicker}</p>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Flow (global) */}
        {mode.flow && (
          <section className="l-sec l-sec-ink" id="flow">
            <div className="l-wrap">
              <p className="l-eyebrow lr">India → UAE</p>
              <h2 className="l-h2 lr">{mode.flow.title}</h2>
              <p className="l-sub lr">{mode.flow.sub}</p>
              <FlowDiagram flow={mode.flow} />
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="l-sec l-sec-soft" id="how">
          <div className="l-wrap l-how">
            <div className="l-how-head">
              <p className="l-eyebrow lr">{mode.timeline.eyebrow}</p>
              <h2 className="l-h2 lr">{mode.timeline.title}</h2>
              <p className="l-sub lr">{mode.timeline.sub}</p>
            </div>
            <Timeline steps={mode.timeline.steps} />
          </div>
        </section>

        {/* Order day */}
        <section className="l-sec" id="order-day">
          <div className="l-wrap">
            <p className="l-eyebrow lr">Order day</p>
            <h2 className="l-h2 lr">{mode.orderDay.title}</h2>
            <p className="l-sub lr">{mode.orderDay.sub}</p>
            <Lanes lanes={mode.orderDay.lanes} />
            <div className="l-notes">
              {mode.orderDay.notes.map((n) => (
                <article key={n.title} className="l-note lr"><h3>{n.title}</h3><p>{n.desc}</p></article>
              ))}
            </div>
          </div>
        </section>

        {/* Commission */}
        <section className="l-sec l-sec-ink" id="commission">
          <div className="l-wrap">
            <p className="l-eyebrow lr">Commission</p>
            <h2 className="l-h2 lr">{mode.commission.title}</h2>
            <p className="l-sub lr">{mode.commission.sub}</p>
            <Calculator key={code} c={mode.commission} rates={rates} failed={failed} />
            {failed && <p className="l-fine lr">Live rates could not load right now. Your exact rate is shown in your agreement before you sign.</p>}
            {mode.stores && (
              <div className="l-stores">
                <h3 className="l-h3 lr">{mode.stores.title}</h3>
                <p className="l-sub lr">{mode.stores.sub}</p>
                <div className="l-stores-grid">
                  {mode.stores.cards.map((s) => (
                    <article key={s.name} className="l-store lr">
                      <div className="l-store-head">
                        <div><h4>{s.name}</h4><span className="l-mono">{s.host}</span></div>
                        <strong><Rate rates={rates} k={s.rate} failed={failed} /></strong>
                      </div>
                      <dl>{s.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* What you get */}
        <section className="l-sec" id="features">
          <div className="l-wrap">
            <p className="l-eyebrow lr">What you get</p>
            <h2 className="l-h2 lr">{mode.features.title}</h2>
            <p className="l-sub lr">{mode.features.sub}</p>
            <div className="l-feats">
              {mode.features.items.map((f, i) => (
                <article key={f.title} className="l-feat lr" style={{ "--d": `${(i % 3) * 70}ms` } as React.CSSProperties}>
                  <span className="l-feat-i"><Icon name={f.icon} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="l-sec l-sec-soft" id="documents">
          <div className="l-wrap">
            <p className="l-eyebrow lr">Documents</p>
            <h2 className="l-h2 lr">{mode.documents.title}</h2>
            <p className="l-sub lr">{mode.documents.sub}</p>
            <div className="l-docs">
              {mode.documents.groups.map((g) => (
                <article key={g.title} className="l-doc lr">
                  <h3>{g.title}</h3>
                  <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="l-sec" id="faq">
          <div className="l-wrap l-faq-grid">
            <div>
              <p className="l-eyebrow lr">FAQ</p>
              <h2 className="l-h2 lr">Questions, answered.</h2>
              <p className="l-sub lr">Something else? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
            </div>
            <div className="lr"><Faq items={mode.faq} /></div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="l-final" id="start">
          <div className="l-wrap">
            <h2 className="l-final-h lr">{mode.final.title.map((l, i) => <span key={l} className={i === mode.final.title.length - 1 ? "red" : ""}>{l}</span>)}</h2>
            <p className="l-lead lr">{mode.final.sub}</p>
            <div className="l-final-cta lr">
              {waitlist ? <WaitlistForm waitlist={waitlist} /> : <Magnetic href={mode.signup.href} variant="white">{mode.signup.label}</Magnetic>}
              <a href={mode.login.href} className="l-btn l-btn-ghost"><span>{waitlist ? "Already a seller? Log in" : mode.login.label}</span></a>
            </div>
            <p className="l-final-foot lr">{mode.footnote}</p>
          </div>
        </section>
      </main>

      <footer className="l-foot">
        <div className="l-wrap l-foot-row">
          <span>© {new Date().getFullYear()} {LEGAL_NAME} · DPIIT recognised startup ({DPIIT_NUMBER})</span>
          <nav aria-label="Legal">
            <a href="/terms">Terms</a><a href="/privacy-policy">Privacy</a><a href="/refund-policy">Refunds</a><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
