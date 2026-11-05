import uae, { AGREEMENT, CHANNEL, CONCIERGE, RATES, WAITLIST } from "@/app/landing/content/ae";
import { faqLd, organizationLd, webPageLd } from "@/app/lib/seo";
import { uaePaymentOptions, type ConfigPaymentMethod } from "@/app/lib/landing-data";
import { AED, formatMoney } from "@/app/lib/currency";
import { LEGAL_ENTITY_UAE, UAE_SITE_URL } from "@/app/lib/seller-config";
import { splitPrice, type UaeRateCard } from "@/app/lib/rate-card";
import { Calculator, WaitlistForm } from "./parts";
import { Cards, FaqSection, FinalCta, Heading, Hero, Page, Steps } from "./sections";

const SECTIONS = [
  { id: "payments", label: "Payments" },
  { id: "team", label: "Our team" },
  { id: "rates", label: "Rate card" },
  { id: "how", label: "How to onboard" },
  { id: "faq", label: "FAQ" },
];

export function RateCardTable({ rates }: { rates: UaeRateCard }) {
  const rows = [
    { category: "Electronics", ships: "Seller ships", pct: rates.electronics_seller_ships_pct, price: RATES.electronicsExample },
    { category: "Electronics", ships: "NOTMADE ships", pct: rates.electronics_notmade_ships_pct, price: RATES.electronicsExample },
    { category: "Fashion and accessories", ships: "Shipping included", pct: rates.fashion_accessories_pct, price: RATES.fashionExample },
  ];
  return (
    <table className="n-rates nr">
      <thead><tr><th scope="col">Category</th><th scope="col">Shipping</th><th scope="col">Commission</th><th scope="col">Example sale</th><th scope="col">You receive</th></tr></thead>
      <tbody>
        {rows.map((r) => {
          const { commission, payout } = splitPrice(r.price, r.pct);
          return (
            <tr key={`${r.category}-${r.ships}`}>
              <th scope="row" data-label="Category">{r.category}</th>
              <td data-label="Shipping">{r.ships}</td>
              <td data-label="Commission" className="n-rate-pct">{r.pct}%</td>
              <td data-label="Example sale">{formatMoney(r.price, AED)}<small>− {formatMoney(commission, AED)} commission</small></td>
              <td data-label="You receive" className="n-rate-pay">{formatMoney(payout, AED)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function UaeLanding({ rates, methods, signupOpen }: { rates: UaeRateCard; methods: ConfigPaymentMethod[]; signupOpen: boolean }) {
  const primary = signupOpen ? uae.signup : { label: WAITLIST.label, href: "#start" };
  const payments = uaePaymentOptions(methods);
  return (
    <Page content={uae} entity={LEGAL_ENTITY_UAE} sections={SECTIONS} primary={primary}
      footerLinks={[{ label: "How to onboard", href: "#how" }, { label: "Rate card", href: "#rates" }]}
      ld={[
        organizationLd({ legalName: LEGAL_ENTITY_UAE, url: UAE_SITE_URL, country: "AE" }),
        webPageLd({ name: uae.meta.title, description: uae.meta.description, path: "/uae", country: "AE" }),
        faqLd(uae.faq),
      ]}>
      <Hero hero={uae.hero} primary={primary} secondary={{ label: "See the rate card", href: "#rates" }}
        aside={(
          <div className="n-hero-card nh" aria-label="How shoppers reach you">
            <p className="n-label">How shoppers buy</p>
            <ul>{CONCIERGE.channels.slice(0, 2).map((c) => <li key={c}>{c}<span>Our team helps them order</span></li>)}</ul>
            <ul>{payments.options.slice(0, 2).map((o) => <li key={o.name}>{o.name}<span>{o.note}</span></li>)}</ul>
          </div>
        )} />

      <section className="n-sec" id="channel" aria-labelledby="channel-h">
        <div className="n-wrap">
          <Heading id="channel-h" eyebrow="For UAE brands" title={CHANNEL.title} sub={CHANNEL.sub} />
          <Cards items={CHANNEL.items} />
        </div>
      </section>

      <section className="n-sec n-sec-dark" id="payments" aria-labelledby="payments-h">
        <div className="n-wrap">
          <Heading id="payments-h" eyebrow="Payments" title="Secure ways for shoppers to pay." />
          <ul className="n-pay">
            {payments.options.map((o) => <li key={o.name} className="nr"><strong>{o.name}</strong><span>{o.note}</span></li>)}
            {payments.moreComing && <li className="n-pay-more nr"><strong>More options coming</strong></li>}
          </ul>
        </div>
      </section>

      <section className="n-sec" id="team" aria-labelledby="team-h">
        <div className="n-wrap">
          <Heading id="team-h" eyebrow="Order and payment help" title={CONCIERGE.title} sub={CONCIERGE.sub} />
          <ul className="n-chips nr">{CONCIERGE.channels.map((c) => <li key={c}>{c}</li>)}</ul>
          <Cards items={CONCIERGE.items} />
        </div>
      </section>

      <section className="n-sec n-sec-soft" id="rates" aria-labelledby="rates-h">
        <div className="n-wrap">
          <Heading id="rates-h" eyebrow="Commission" title={RATES.title} sub={RATES.sub} />
          <RateCardTable rates={rates} />
          <p className="n-rate-line nr">{RATES.newSellers}</p>
          <div className="n-money n-money-top">
            <div className="n-agree nr">
              <h3>{AGREEMENT.title}</h3>
              <p>{AGREEMENT.body}</p>
              <p>{AGREEMENT.payout}</p>
            </div>
            <Calculator currency={AED} defaultPrice={RATES.electronicsExample} note={RATES.newSellers}
              rates={[
                { label: "Seller ships", pct: rates.electronics_seller_ships_pct },
                { label: "NOTMADE ships", pct: rates.electronics_notmade_ships_pct },
                { label: "Fashion", pct: rates.fashion_accessories_pct },
              ]} />
          </div>
        </div>
      </section>

      <Steps steps={uae.steps} />
      <FaqSection items={uae.faq} />
      <FinalCta code="ae" final={uae.final}>
        {signupOpen
          ? <a href={uae.signup.href} className="n-btn n-btn-red">{uae.signup.label}</a>
          : <WaitlistForm label={WAITLIST.label} note={WAITLIST.note} done={WAITLIST.done} market={WAITLIST.market} />}
        <a href={uae.login.href} className="n-btn n-btn-ghost">{signupOpen ? uae.login.label : "Already a seller? Log in"}</a>
      </FinalCta>
    </Page>
  );
}
