import uae, { CHANNEL, CONCIERGE, PAYMENTS, WAITLIST } from "@/app/landing/content/ae";
import { faqLd, organizationLd, webPageLd } from "@/app/lib/seo";
import { uaePaymentOptions, type StorePaymentConfig } from "@/app/lib/landing-data";
import { AED } from "@/app/lib/currency";
import { LEGAL_ENTITY_UAE, UAE_SITE_URL } from "@/app/lib/seller-config";
import type { RateRow } from "@/app/landing/content/types";
import { Calculator, WaitlistForm } from "./parts";
import { Cards, FaqSection, FinalCta, Heading, Hero, Page, Points, RateTiles, Steps } from "./sections";

const SECTIONS = [
  { id: "commission", label: "Commission" },
  { id: "payments", label: "Payments" },
  { id: "team", label: "Our team" },
  { id: "how", label: "How to register" },
  { id: "faq", label: "FAQ" },
];

export default function UaeLanding({ rates = uae.rates, payments, signupOpen }: {
  rates?: RateRow[]; payments: StorePaymentConfig | null; signupOpen: boolean;
}) {
  const primary = signupOpen ? uae.signup : { label: WAITLIST.cta, href: "#start" };
  const { options, moreComing } = uaePaymentOptions(payments);
  return (
    <Page content={uae} sections={SECTIONS} primary={primary}
      footerLinks={[{ label: "How to register", href: "#how" }, { label: "Commission", href: "#commission" }]}
      ld={[
        organizationLd({ legalName: LEGAL_ENTITY_UAE, url: UAE_SITE_URL, country: "AE" }),
        webPageLd({ name: uae.meta.title, description: uae.meta.description, path: "/uae", country: "AE" }),
        faqLd(uae.faq),
      ]}>
      <Hero hero={uae.hero} rates={rates} primary={primary} secondary={{ label: "See the commission", href: "#commission" }} />

      <section className="n-sec" id="commission" aria-labelledby="commission-h">
        <div className="n-wrap">
          <Heading id="commission-h" eyebrow="Commission and payout" title={uae.commission.title} sub={uae.commission.sub} />
          <RateTiles rates={rates} />
          <div className="n-money n-money-top">
            <Points items={uae.promises} />
            <Calculator currency={AED} defaultPrice={uae.commission.example} note="Before any VAT on commission and adjustments."
              rates={rates.map((r) => ({ label: r.short, pct: r.pct }))} />
          </div>
        </div>
      </section>

      <section className="n-sec n-sec-dark" id="payments" aria-labelledby="payments-h">
        <div className="n-wrap">
          <Heading id="payments-h" eyebrow="Payments" title={options.length > 1 ? PAYMENTS.title : PAYMENTS.titleFew} />
          <ul className="n-pay">
            {options.map((o) => <li key={o.name} className="nr"><strong>{o.name}</strong><span>{o.note}</span></li>)}
            {moreComing && <li className="n-pay-more nr"><strong>{PAYMENTS.more}</strong></li>}
          </ul>
        </div>
      </section>

      <section className="n-sec n-sec-soft" id="channel" aria-labelledby="channel-h">
        <div className="n-wrap">
          <Heading id="channel-h" eyebrow="For UAE brands" title={CHANNEL.title} sub={CHANNEL.sub} />
          <Cards items={CHANNEL.items} />
        </div>
      </section>

      <section className="n-sec" id="team" aria-labelledby="team-h">
        <div className="n-wrap">
          <Heading id="team-h" eyebrow="Order and payment help" title={CONCIERGE.title} sub={CONCIERGE.sub} />
          <ul className="n-chips nr">{CONCIERGE.channels.map((c) => <li key={c}>{c}</li>)}</ul>
          <Cards items={CONCIERGE.items} />
        </div>
      </section>

      <Steps steps={uae.steps} tutorial={uae.tutorial} cta={primary} />
      <FaqSection items={uae.faq} />
      <FinalCta code="ae" final={signupOpen ? uae.final : WAITLIST.final}>
        {signupOpen
          ? <a href={uae.signup.href} className="n-btn n-btn-red">{uae.signup.label}</a>
          : <WaitlistForm label={WAITLIST.label} done={WAITLIST.done} market={WAITLIST.market}
              note={<>{WAITLIST.note} Questions? <a href={`mailto:${WAITLIST.contact}`}>{WAITLIST.contact}</a></>} />}
        <a href={uae.login.href} className="n-btn n-btn-ghost">{signupOpen ? uae.login.label : "Already a seller? Log in"}</a>
      </FinalCta>
    </Page>
  );
}
