import india, { AGREEMENT, CATEGORIES, PAYOUT, SUPPORT } from "@/app/landing/content/in";
import { faqLd, organizationLd, webPageLd } from "@/app/lib/seo";
import { INR } from "@/app/lib/currency";
import { COMMISSION_PCT_INDIA, COMMISSION_STATEMENT_INDIA, LEGAL_ENTITY_INDIA, MAIN_SITE_URL } from "@/app/lib/seller-config";
import { Calculator } from "./parts";
import { Cards, FaqSection, FinalCta, Heading, Hero, Page, Points, Steps } from "./sections";

const SECTIONS = [
  { id: "categories", label: "Categories" },
  { id: "support", label: "Support" },
  { id: "commission", label: "Commission" },
  { id: "how", label: "How to onboard" },
  { id: "faq", label: "FAQ" },
];

export default function IndiaLanding() {
  const primary = india.signup;
  return (
    <Page content={india} entity={LEGAL_ENTITY_INDIA} sections={SECTIONS} primary={primary}
      footerLinks={[{ label: "How to onboard", href: "#how" }, { label: "Commission", href: "#commission" }]}
      ld={[
        organizationLd({ legalName: LEGAL_ENTITY_INDIA, url: MAIN_SITE_URL, country: "IN" }),
        webPageLd({ name: india.meta.title, description: india.meta.description, path: "/", country: "IN" }),
        faqLd(india.faq),
      ]}>
      <Hero hero={india.hero} primary={primary} secondary={{ label: "How to onboard", href: "#how" }} />

      <section className="n-sec" id="categories" aria-labelledby="categories-h">
        <div className="n-wrap">
          <Heading id="categories-h" eyebrow="What you can sell" title="Many categories, one store." sub="From your first collection to your full range." />
          <ul className="n-chips nr">{CATEGORIES.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <section className="n-sec n-sec-soft" id="support" aria-labelledby="support-h">
        <div className="n-wrap">
          <Heading id="support-h" eyebrow="Why NOTMADE" title="We help you sell and ship." />
          <Cards items={SUPPORT} />
        </div>
      </section>

      <section className="n-sec" id="commission" aria-labelledby="commission-h">
        <div className="n-wrap n-money">
          <div>
            <p className="n-eyebrow nr">Commission and payout</p>
            <h2 id="commission-h" className="n-h2 nr">One simple rate.</h2>
            <p className="n-rate-line nr">{COMMISSION_STATEMENT_INDIA}</p>
            <Points items={PAYOUT.points} />
          </div>
          <Calculator rates={[{ label: "Commission", pct: COMMISSION_PCT_INDIA }]} currency={INR} defaultPrice={1999}
            note={`Before GST on commission and TDS. ${PAYOUT.title} ${AGREEMENT.body}`} />
        </div>
      </section>

      <Steps steps={india.steps} />
      <FaqSection items={india.faq} />
      <FinalCta code="in" final={india.final}>
        <a href={primary.href} className="n-btn n-btn-red">{primary.label}</a>
        <a href={india.login.href} className="n-btn n-btn-ghost">{india.login.label}</a>
      </FinalCta>
    </Page>
  );
}
