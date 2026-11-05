// Page sections shared by the landing pages. Copy always arrives as props.
import type { Cta, Fact, Item, PageContent } from "@/app/landing/content/types";
import type { Section } from "./SiteHeader";
import SiteHeader, { CountrySwitch } from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { Faq, Reveal } from "./parts";
import { ldJson } from "@/app/lib/seo";
import "./landing.css";

export function Page({ content, entity, sections, footerLinks, primary, ld, children }: {
  content: PageContent; entity: string; sections: Section[]; footerLinks: Cta[]; primary: Cta; ld: unknown[]; children: React.ReactNode;
}) {
  return (
    <div className="n" data-mode={content.code}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <a href="#main" className="n-skip">Skip to content</a>
      <SiteHeader code={content.code} sections={sections} login={content.login} primary={primary} />
      <Reveal>{children}</Reveal>
      <a href={primary.href} className="n-btn n-btn-red n-sticky-cta">{primary.label}</a>
      <SiteFooter code={content.code} entity={entity} login={content.login} primary={primary} links={footerLinks} />
    </div>
  );
}

export function Hero({ hero, primary, secondary, aside }: {
  hero: PageContent["hero"]; primary: Cta; secondary: Cta; aside?: React.ReactNode;
}) {
  return (
    <section className="n-hero" id="top">
      <div className={aside ? "n-wrap n-hero-grid" : "n-wrap"}>
        <div>
          <p className="n-kicker nh">{hero.kicker}</p>
          <h1 className="n-h1 nh">
            {hero.headline.map((line, i) => <span key={line} className={i === hero.headline.length - 1 ? "red" : ""}>{line}</span>)}
          </h1>
          <p className="n-lead nh">{hero.sub}</p>
          <div className="n-cta nh">
            <a href={primary.href} className="n-btn n-btn-red">{primary.label}</a>
            <a href={secondary.href} className="n-btn n-btn-ghost">{secondary.label}</a>
          </div>
        </div>
        {aside}
      </div>
      <div className="n-wrap"><Proof facts={hero.proof} /></div>
    </section>
  );
}

function Proof({ facts }: { facts: Fact[] }) {
  return (
    <ul className="n-proof nh">
      {facts.map((f) => <li key={f.label}><strong>{f.value}</strong><span>{f.label}</span></li>)}
    </ul>
  );
}

export function Heading({ id, eyebrow, title, sub }: { id: string; eyebrow: string; title: string; sub?: string }) {
  return (
    <>
      <p className="n-eyebrow nr">{eyebrow}</p>
      <h2 id={id} className="n-h2 nr">{title}</h2>
      {sub && <p className="n-sub nr">{sub}</p>}
    </>
  );
}

export function Cards({ items }: { items: Item[] }) {
  return (
    <ul className="n-cards">
      {items.map((c, i) => (
        <li key={c.title} className="n-card nr" style={{ "--d": `${Math.min(i, 4) * 50}ms` } as React.CSSProperties}>
          <h3>{c.title}</h3><p>{c.desc}</p>
        </li>
      ))}
    </ul>
  );
}

export function Points({ items }: { items: Item[] }) {
  return (
    <ul className="n-points">
      {items.map((pt) => <li key={pt.title} className="nr"><h3>{pt.title}</h3><p>{pt.desc}</p></li>)}
    </ul>
  );
}

export function Steps({ steps }: { steps: PageContent["steps"] }) {
  return (
    <section className="n-sec n-sec-soft" id="how" aria-labelledby="how-h">
      <div className="n-wrap">
        <Heading id="how-h" eyebrow="How to onboard" title={steps.title} sub={steps.sub} />
        <ol className="n-steps">
          {steps.items.map((s, i) => (
            <li key={s.title} className="n-step nr" style={{ "--d": `${Math.min(i, 4) * 50}ms` } as React.CSSProperties}>
              <span className="n-step-n" aria-hidden>{i + 1}</span>
              <div><h3>{s.title}</h3><p>{s.desc}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FaqSection({ items }: { items: PageContent["faq"] }) {
  return (
    <section className="n-sec" id="faq" aria-labelledby="faq-h">
      <div className="n-wrap n-faq-grid">
        <div>
          <p className="n-eyebrow nr">FAQ</p>
          <h2 id="faq-h" className="n-h2 nr">Questions, answered.</h2>
        </div>
        <div className="nr"><Faq items={items} /></div>
      </div>
    </section>
  );
}

export function FinalCta({ code, final, children }: { code: PageContent["code"]; final: PageContent["final"]; children: React.ReactNode }) {
  return (
    <section className="n-final" id="start" aria-labelledby="start-h">
      <div className="n-wrap">
        <h2 id="start-h" className="n-h2 nr">{final.title}</h2>
        <p className="n-lead nr">{final.sub}</p>
        <div className="n-cta nr">{children}</div>
        <div className="n-switch-row nr"><span>Selling from</span><CountrySwitch value={code} /></div>
      </div>
    </section>
  );
}
