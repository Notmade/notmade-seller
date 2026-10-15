"use client";

import { useEffect, useRef, useState } from "react";
import "./landing.css";
import { getMode, type ModeCode } from "@/app/landing/content";
import { writeMarketCookie } from "../market";
import { reducedMotion, useRates, useReveal } from "./hooks";
import { Calculator, Faq, WaitlistForm } from "./parts";
import SiteHeader, { MarketSwitch } from "./SiteHeader";
import SiteFooter from "./SiteFooter";

type Props = { initial: ModeCode; uaeSignupOpen: boolean };

export default function Landing({ initial, uaeSignupOpen }: Props) {
  const [code, setCode] = useState<ModeCode>(initial);
  const mode = getMode(code);
  const rates = useRates();
  const mainRef = useRef<HTMLElement>(null);
  useReveal(mainRef, code);

  // Back/forward between modes
  useEffect(() => {
    const pop = () => setCode(getMode(new URL(window.location.href).searchParams.get("market")).code);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  const choose = (next: ModeCode) => {
    if (next === code) return;
    setCode(next);
    writeMarketCookie(next);
    const url = new URL(window.location.href);
    url.searchParams.set("market", next);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    if (window.scrollY > 400) window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const waitlist = mode.code === "ae" && !uaeSignupOpen ? mode.signup.waitlist : undefined;
  const primary = waitlist ? { label: waitlist.label, href: "#start" } : { label: mode.signup.label, href: mode.signup.href };

  return (
    <div className="n" data-mode={code}>
      <a href="#main" className="n-skip">Skip to content</a>
      <SiteHeader code={code} onMarket={choose} login={mode.login} primary={primary} />

      <main id="main" ref={mainRef} key={code} className="n-main">
        {/* Hero */}
        <section className="n-hero" id="top">
          <div className="n-wrap">
            <p className="n-kicker nh">{mode.hero.kicker}</p>
            <h1 className="n-h1 nh">
              {mode.hero.headline.map((line, i) => (
                <span key={line} className={i === mode.hero.headline.length - 1 ? "red" : ""}>{line}</span>
              ))}
            </h1>
            <p className="n-lead nh">{mode.hero.sub}</p>
            <div className="n-cta nh">
              <a href={primary.href} className="n-btn n-btn-red">{primary.label}</a>
              <a href="#how" className="n-btn n-btn-line">How it works</a>
            </div>
            <ul className="n-proof nh">
              {mode.hero.proof.map((f) => (
                <li key={f.label}><strong>{f.value}</strong><span>{f.label}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="n-sec n-sec-soft" id="how" aria-labelledby="how-h">
          <div className="n-wrap">
            <p className="n-eyebrow nr">How it works</p>
            <h2 id="how-h" className="n-h2 nr">{mode.steps.title}</h2>
            <p className="n-sub nr">{mode.steps.sub}</p>
            <ol className="n-steps">
              {mode.steps.items.map((s, i) => (
                <li key={s.title} className="n-step nr" style={{ "--d": `${Math.min(i, 4) * 50}ms` } as React.CSSProperties}>
                  <span className="n-step-n" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <div><h3>{s.title}</h3><p>{s.desc}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Delivery */}
        <section className="n-sec" id="delivery" aria-labelledby="delivery-h">
          <div className="n-wrap">
            <p className="n-eyebrow nr">Delivery</p>
            <h2 id="delivery-h" className="n-h2 nr">{mode.delivery.title}</h2>
            <p className="n-sub nr">{mode.delivery.sub}</p>
            <ul className="n-facts">
              {mode.delivery.items.map((f) => (
                <li key={f.label} className="n-fact nr">
                  <span className="n-label">{f.label}</span>
                  <strong>{f.value}</strong>
                  {f.note && <p>{f.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Commission and payout */}
        <section className="n-sec n-sec-soft" id="commission" aria-labelledby="commission-h">
          <div className="n-wrap n-money">
            <div>
              <p className="n-eyebrow nr">Commission and payout</p>
              <h2 id="commission-h" className="n-h2 nr">{mode.money.title}</h2>
              <p className="n-sub nr">{mode.money.sub}</p>
              <ul className="n-points">
                {mode.money.points.map((pt) => (
                  <li key={pt.title} className="nr"><h3>{pt.title}</h3><p>{pt.desc}</p></li>
                ))}
              </ul>
            </div>
            <Calculator key={code} calc={mode.money.calc} rates={rates} />
          </div>
        </section>

        {/* Returns */}
        <section className="n-sec" id="returns" aria-labelledby="returns-h">
          <div className="n-wrap">
            <p className="n-eyebrow nr">Returns</p>
            <h2 id="returns-h" className="n-h2 nr">{mode.returns.title}</h2>
            <p className="n-sub nr">{mode.returns.sub}</p>
            <ul className="n-checks nr">
              {mode.returns.points.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="n-sec n-sec-soft" id="faq" aria-labelledby="faq-h">
          <div className="n-wrap n-faq-grid">
            <div>
              <p className="n-eyebrow nr">FAQ</p>
              <h2 id="faq-h" className="n-h2 nr">Questions, answered.</h2>
            </div>
            <div className="nr"><Faq items={mode.faq} /></div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="n-final" id="start" aria-labelledby="start-h">
          <div className="n-wrap">
            <h2 id="start-h" className="n-h2 nr">{mode.final.title}</h2>
            <p className="n-lead nr">{mode.final.sub}</p>
            <div className="n-switch-row nr">
              <span>Selling from</span>
              <MarketSwitch value={code} onChange={choose} />
            </div>
            <div className="n-cta nr">
              {waitlist ? <WaitlistForm waitlist={waitlist} /> : <a href={mode.signup.href} className="n-btn n-btn-red">{mode.signup.label}</a>}
              <a href={mode.login.href} className="n-btn n-btn-ghost">{waitlist ? "Already a seller? Log in" : mode.login.label}</a>
            </div>
            <p className="n-fine">Full terms are in the seller agreement shown at sign-up.</p>
          </div>
        </section>
      </main>

      <SiteFooter login={mode.login} primary={primary} />
    </div>
  );
}
