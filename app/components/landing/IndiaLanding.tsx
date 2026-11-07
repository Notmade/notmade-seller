import india, { AGREEMENT, CATEGORIES, SUPPORT } from "@/app/landing/content/in";
import { faqLd, organizationLd, webPageLd } from "@/app/lib/seo";
import { INR } from "@/app/lib/currency";
import { LEGAL_ENTITY_INDIA, MAIN_SITE_URL } from "@/app/lib/seller-config";
import type { RateRow } from "@/app/landing/content/types";
import { Calculator } from "./parts";
import { Cards, FaqSection, FinalCta, Heading, Hero, Page, Points, RateTiles, Steps } from "./sections";

const SECTIONS = [
  { id: "commission", label: "Commission" },
  { id: "categories", label: "Categories" },
  { id: "how", label: "How to register" },
  { id: "faq", label: "FAQ" },
];

export default function IndiaLanding({ rates = india.rates }: { rates?: RateRow[] }) {
  const primary = india.signup;
  return (
    <Page content={india} sections={SECTIONS} primary={primary}
      footerLinks={[{ label: "How to register", href: "#how" }, { label: "Commission", href: "#commission" }]}
      ld={[
        organizationLd({ legalName: LEGAL_ENTITY_INDIA, url: MAIN_SITE_URL, country: "IN" }),
        webPageLd({ name: india.meta.title, description: india.meta.description, path: "/", country: "IN" }),
        faqLd(india.faq),
      ]}>
      <Hero hero={india.hero} rates={rates} primary={primary} secondary={{ label: "How to register", href: "#how" }} />

      <section className="n-sec n-sec-soft" id="commission" aria-labelledby="commission-h">
        <div className="n-wrap">
          <Heading id="commission-h" eyebrow="Commission and payout" title={india.commission.title} />
          <RateTiles rates={rates} />
          <p className="n-rate-line nr">{india.commission.note}</p>
          <div className="n-money n-money-top">
            <Points items={india.promises} />
            <Calculator rates={rates.map((r) => ({ label: r.short, pct: r.pct }))} currency={INR} defaultPrice={india.commission.example}
              note={`Before ${india.commission.note} ${AGREEMENT.body}`} />
          </div>
        </div>
      </section>

      <section className="n-sec" id="categories" aria-labelledby="categories-h">
        <div className="n-wrap">
          <Heading id="categories-h" eyebrow="What you can sell" title="Many categories, one store." sub="From your first collection to your full range." />
          <ul className="n-chips nr">{CATEGORIES.map((c) => <li key={c}>{c}</li>)}</ul>
          <Cards items={SUPPORT} />
        </div>
      </section>

      <Steps steps={india.steps} tutorial={india.tutorial} cta={primary} />
      <FaqSection items={india.faq} />
      <FinalCta code="in" final={india.final}>
        <a href={primary.href} className="n-btn n-btn-red">{primary.label}</a>
        <a href={india.login.href} className="n-btn n-btn-ghost">{india.login.label}</a>
      </FinalCta>
    </Page>
  );
}
