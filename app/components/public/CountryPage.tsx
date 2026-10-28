import PublicPage, { EntityDetails, Section } from "./PublicPage";
import RateCalculator from "./RateCalculator";
import { Faq, WaitlistForm } from "../landing/parts";
import { getMode } from "@/app/landing/content";
import { getPage } from "@/app/lib/public-pages";
import { faqLd, webPageLd } from "@/app/lib/seo";
import { ENTITY_BY_COUNTRY, MIN_PRODUCTS, REVIEW_HOURS } from "@/app/lib/seller-config";
import { getMarket } from "@/src/config/markets";

// Country-specific facts that are not landing copy. Each line comes from the onboarding form, the
// backend's required documents or the country's seller agreement.
const COUNTRY = {
  in: {
    page: "sell-in-india",
    title: ["Sell online", "in India."],
    agreement: "NOTMADE Seller Agreement, India-based seller terms",
    who: [
      "Businesses based in India, with or without GST registration.",
      "You sign the India seller agreement, which covers sales on the NOTMADE India store and its partner channels in India.",
    ],
    what: [
      "Fashion and lifestyle products for NOTMADE's India store.",
      "Every product must be genuine, accurately described and compliant with Indian law, including labelling and BIS rules where they apply.",
      `At least ${MIN_PRODUCTS} products to go live.`,
    ],
    documents: [
      "Business details: legal name as on your PAN or GST registration, brand name, contact person, mobile number and address.",
      "If you are GST registered: your GSTIN and GST certificate.",
      "If you are not GST registered: your PAN card and the front of your Aadhaar.",
      "A bank account in your business name for settlements.",
    ],
    deductions: "Each settlement deducts the commission, GST on the commission, TDS where it applies, and adjustments for returns, cancellations, refunds or chargebacks. You get a settlement statement for each one.",
    returnsCost: "If a return is caused by a product defect, a wrong description or a seller error, you bear the return cost. If it is caused by a platform error, NOTMADE does.",
    invoices: "You issue a GST-compliant invoice directly to the customer for each order.",
  },
  ae: {
    page: "sell-in-uae",
    title: ["Sell online", "in the UAE."],
    agreement: "NOTMADE Seller Agreement — UAE, UAE-based seller terms",
    who: [
      "Businesses established in the UAE that hold a valid trade licence for as long as they sell.",
      "You sign the UAE seller agreement, which covers sales to customers in the UAE.",
    ],
    what: [
      "Products for NOTMADE's UAE store, priced by you.",
      "Every product must be genuine, accurately described and compliant with UAE consumer protection, labelling and product safety rules.",
    ],
    documents: [
      "Business details: legal name as on your trade licence, brand name, contact person, mobile number, address and emirate.",
      "Your trade licence number, and the licence itself.",
      "Your Emirates ID or passport.",
      "Your TRN, only if you are VAT registered.",
      "The IBAN of your UAE bank account for settlements.",
    ],
    deductions: "Each settlement deducts the commission, VAT on the commission where it applies, and adjustments for returns, cancellations, refunds or chargebacks. You get a settlement statement for each one.",
    returnsCost: "NOTMADE reviews the unboxing video and decides the claim. If an approved claim comes from a product defect, a wrong description or a seller error, you bear the cost. If it comes from transit damage or a platform error, NOTMADE does.",
    invoices: "If you are VAT registered, you issue VAT-compliant tax invoices as UAE law requires, and your prices include VAT.",
  },
} as const;

export default function CountryPage({ code, signupOpen = true }: { code: "in" | "ae"; signupOpen?: boolean }) {
  const mode = getMode(code);
  const market = getMarket(code);
  const c = COUNTRY[code];
  const page = getPage(c.page);
  const waitlist = !signupOpen ? mode.signup.waitlist : undefined;
  const primary = waitlist ? { label: waitlist.label, href: "#start" } : { label: mode.signup.label, href: mode.signup.href };
  const country = { code: market.sellerCountry, name: market.name === "UAE" ? "United Arab Emirates" : market.name };

  return (
    <PublicPage
      page={c.page}
      kicker={`Sell in ${market.name}`}
      title={c.title.map((line, i) => <span key={line} className={i === c.title.length - 1 ? "red" : ""}>{line}</span>)}
      lead={<p>{mode.hero.sub}</p>}
      primary={primary}
      login={mode.login}
      actions={<>
        <a href={primary.href} className="n-btn n-btn-red">{primary.label}</a>
        <a href="#documents" className="n-btn n-btn-line">What you need</a>
      </>}
      jsonLd={[webPageLd(page, country), faqLd(mode.faq)]}
    >
      <div className="n-wrap">
        <ul className="n-proof" style={{ marginTop: 0 }}>
          {mode.hero.proof.map((f) => <li key={f.label}><strong>{f.value}</strong><span>{f.label}</span></li>)}
        </ul>
      </div>

      <Section id="who" eyebrow="Who can sell" title={`Selling in ${market.name}.`} soft>
        <div className="n-cols">
          <div className="n-card"><h3>Who can sell</h3><ul>{c.who.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="n-card"><h3>What you can sell</h3><ul>{c.what.map((t) => <li key={t}>{t}</li>)}</ul></div>
        </div>
      </Section>

      <Section id="documents" eyebrow="Documents" title="What you need to sign up."
        sub={`Sign up with your email and a one-time code, then add these in the panel. Our team reviews your account after you sign the agreement, usually within ${REVIEW_HOURS} hours.`}>
        <ul className="n-checks">{c.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      </Section>

      <Section id="how" eyebrow="How it works" title={mode.steps.title} sub={mode.steps.sub} soft>
        <ol className="n-steps">
          {mode.steps.items.map((s, i) => (
            <li key={s.title} className="n-step">
              <span className="n-step-n" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{s.title}</h3><p>{s.desc}</p></div>
            </li>
          ))}
        </ol>
        <p className="n-more"><a href="/how-it-works">How selling on NOTMADE works</a></p>
      </Section>

      <section className="n-sec" id="commission" aria-labelledby="commission-h">
        <div className="n-wrap n-money">
          <div>
            <p className="n-eyebrow">Commission and payout</p>
            <h2 id="commission-h" className="n-h2">{mode.money.title}</h2>
            <p className="n-sub">{mode.money.sub}</p>
            <ul className="n-points">
              {mode.money.points.map((pt) => <li key={pt.title}><h3>{pt.title}</h3><p>{pt.desc}</p></li>)}
              <li><h3>What is deducted</h3><p>{c.deductions}</p></li>
              <li><h3>Invoices</h3><p>{c.invoices}</p></li>
            </ul>
            <p className="n-more"><a href="/fees-and-payouts">Fees and payouts in detail</a></p>
          </div>
          <RateCalculator calc={mode.money.calc} />
        </div>
      </section>

      <Section id="delivery" eyebrow="Delivery" title={mode.delivery.title} sub={mode.delivery.sub} soft>
        <ul className="n-facts">
          {mode.delivery.items.map((f) => (
            <li key={f.label} className="n-fact"><span className="n-label">{f.label}</span><strong>{f.value}</strong>{f.note && <p>{f.note}</p>}</li>
          ))}
        </ul>
      </Section>

      <Section id="returns" eyebrow="Returns" title={mode.returns.title} sub={mode.returns.sub}>
        <ul className="n-checks">{mode.returns.points.map((r) => <li key={r}>{r}</li>)}</ul>
        <p className="n-sub">{c.returnsCost}</p>
      </Section>

      <Section id="company" eyebrow="Who you contract with" title="Company details." soft
        sub={`Sellers based in ${market.name} sign their agreement with this company. The agreement you sign in the panel is the binding text.`}>
        <div className="n-card" style={{ marginTop: 24 }}>
          <EntityDetails entity={ENTITY_BY_COUNTRY[market.sellerCountry]} agreement={c.agreement} />
        </div>
        <p className="n-more"><a href="/seller-agreement">Seller agreement summary</a></p>
      </Section>

      <section className="n-sec" id="faq" aria-labelledby="faq-h">
        <div className="n-wrap n-faq-grid">
          <div>
            <p className="n-eyebrow">FAQ</p>
            <h2 id="faq-h" className="n-h2">Selling in {market.name}, answered.</h2>
            <p className="n-more"><a href="/faq">All seller questions</a></p>
          </div>
          <Faq items={mode.faq} />
        </div>
      </section>

      <section className="n-final" id="start" aria-labelledby="start-h">
        <div className="n-wrap">
          <h2 id="start-h" className="n-h2">{mode.final.title}</h2>
          <p className="n-lead">{mode.final.sub}</p>
          <div className="n-cta">
            {waitlist ? <WaitlistForm waitlist={waitlist} /> : <a href={mode.signup.href} className="n-btn n-btn-red">{mode.signup.label}</a>}
            <a href={mode.login.href} className="n-btn n-btn-ghost">{waitlist ? "Already a seller? Log in" : mode.login.label}</a>
          </div>
          <p className="n-fine">Full terms are in the seller agreement shown at sign-up.</p>
        </div>
      </section>
    </PublicPage>
  );
}
