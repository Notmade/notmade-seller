import { Suspense } from "react";
import { cookies } from "next/headers";
import { Flag, UrlMarketSwitcher, Waitlist } from "./components/market";
import { faqLd, organizationLd, pageMetadata } from "./lib/seo";
import { CONTACT_EMAIL, LEGAL_NAME, MIN_PRODUCTS, RETURN_WINDOW_HOURS } from "./lib/seller-config";
import {
  MARKET_COOKIE, SETTLEMENT_DAYS, UAE_STORE_LIVE, getMarket, isMarketCode, openMarketsSentence, signupHref, type Market,
} from "@/src/config/markets";

export const metadata = pageMetadata({
  title: "Sell on NOTMADE | Seller portal for India and UAE",
  description:
    "Open a NOTMADE seller account. Sell on notmade.in in INR, add the UAE in AED later, and get settled within 7 days after delivery.",
  path: "/",
});

const SETTLEMENT_LINE = `Settlement within ${SETTLEMENT_DAYS} days after your order is delivered, to your bank account in INR (India) or AED (UAE).`;
const UAE_STATUS = UAE_STORE_LIVE ? "Now also available in UAE" : "UAE store launching soon";

const WHATSAPP = [
  { label: "India", display: "+91 93548 52701", href: "https://wa.me/919354852701" },
  { label: "UAE", display: "+971 55 759 0282", href: "https://wa.me/971557590282" },
];

const FAQ = [
  { q: "Who can create a seller account right now?",
    a: `${openMarketsSentence()} Sellers based elsewhere can join the waitlist and we will email them when their country opens.` },
  { q: "What documents do I need?",
    a: "In India: a GST certificate, or your PAN and Aadhaar if you are not GST registered, plus product photos and a bank account. In the UAE: a trade licence, your TRN if you are VAT registered, an Emirates ID or passport, and an IBAN." },
  { q: "When do I get paid?",
    a: `${SETTLEMENT_LINE} Each settlement comes with a statement listing the orders it covers.` },
  { q: "How much commission does NOTMADE take?",
    a: "Commission is a percentage of each completed sale. You see the exact rate for your country before you sign, both during sign up and in the seller agreement." },
  { q: "Do I need to arrange delivery?",
    a: "No. You pack the order and print the shipping label from your dashboard. Our courier partner picks it up from your address and delivers it to the customer." },
  { q: "How do I sign the seller agreement?",
    a: "Online. You read the agreement in your dashboard and sign it with a 6-digit code we send to your email. No printing or scanning." },
  { q: "I am based in India. Can I also sell in the UAE?",
    a: "Yes. Once your account is approved, turn on UAE selling from your dashboard, set a separate AED price for each product and sign a short UAE addendum with an email code." },
  { q: "How many products do I need to go live?",
    a: `At least ${MIN_PRODUCTS} products. Each product is reviewed by our team before it appears on the store.` },
];

const STEPS = [
  { t: "Create your account", d: "Enter your email and confirm it with a one-time code. No password to remember." },
  { t: "Add your business", d: "Tell us where your business is based and upload your documents." },
  { t: "Sign the agreement", d: "Read the seller agreement and sign it with a code sent to your email." },
  { t: "List and sell", d: "Once approved, add your products. We review each one and put it live." },
];

const HANDLE = [
  { t: "Delivery", d: "Our courier partner picks up from your address and delivers to the customer. You see the tracking in your dashboard." },
  { t: "Customer support", d: "Customers talk to us about their orders. We come to you only when we need something about the product." },
  { t: "Returns", d: `Customers can raise a return for a damaged or wrong item within ${RETURN_WINDOW_HOURS} hours of delivery. We review each request and keep you informed.` },
];

const TIMELINE = [
  { t: "Order delivered", d: "The customer receives the order." },
  { t: `${SETTLEMENT_DAYS} days`, d: "Your settlement is due within this window." },
  { t: "Settlement statement", d: "You get a statement of the orders being paid." },
  { t: "Money in your account", d: "We transfer the amount in INR or AED." },
];

type Search = { [key: string]: string | string[] | undefined };

export default function Home({ searchParams }: { searchParams: Search }) {
  const q = typeof searchParams.market === "string" ? searchParams.market : undefined;
  const c = cookies().get(MARKET_COOKIE)?.value;
  const market = getMarket(isMarketCode(q) ? q : c);
  const india = getMarket("in");

  return (
    <div className="s-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd(), faqLd(FAQ)]) }} />

      <header className="s-header">
        <div className="s-wrap s-header-row">
          <a href="/" className="s-wordmark" aria-label="NOTMADE seller home">NOTMADE <small>SELLER</small></a>
          <Suspense fallback={null}><UrlMarketSwitcher compact /></Suspense>
          <a href="/login" className="s-btn s-btn-ghost">Log in</a>
          {market.open
            ? <a href={signupHref(market)} className="s-btn s-btn-red s-hide-sm">Create seller account</a>
            : <a href="#waitlist" className="s-btn s-btn-red s-hide-sm">Create seller account</a>}
        </div>
      </header>

      <main>
        <Hero market={market} />

        <section className="s-section" aria-labelledby="paid">
          <div className="s-wrap">
            <p className="s-pill s-pill-red">Settlement</p>
            <h2 id="paid" className="s-h2" style={{ marginTop: 16 }}>Paid in {SETTLEMENT_DAYS} days</h2>
            <p className="s-lead" style={{ marginTop: 12, maxWidth: 640 }}>{SETTLEMENT_LINE}</p>
            <ol className="s-timeline" style={{ marginTop: 40 }}>
              {TIMELINE.map((s, i) => (
                <li key={s.t}>
                  <span className={i === TIMELINE.length - 1 ? "s-dot s-dot-red" : "s-dot"} aria-hidden />
                  <div>
                    <p className="s-h3" style={{ marginTop: 2 }}>{s.t}</p>
                    <p className="s-note" style={{ marginTop: 4 }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="s-section" aria-labelledby="how">
          <div className="s-wrap">
            <h2 id="how" className="s-h2">How it works</h2>
            <ol className="s-grid-4" style={{ listStyle: "none", padding: 0, margin: "32px 0 0" }}>
              {STEPS.map((s, i) => (
                <li key={s.t} className="s-card">
                  <span className="s-step-num">{i + 1}</span>
                  <p className="s-h3" style={{ marginTop: 16 }}>{s.t}</p>
                  <p className="s-body" style={{ marginTop: 6 }}>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="s-section" aria-labelledby="handle">
          <div className="s-wrap">
            <h2 id="handle" className="s-h2">What we handle</h2>
            <p className="s-lead" style={{ marginTop: 12, maxWidth: 640 }}>You make and pack the product. We take care of the rest.</p>
            <div className="s-grid-3" style={{ marginTop: 32 }}>
              {HANDLE.map(h => (
                <div key={h.t} className="s-card s-card-soft">
                  <p className="s-h3">{h.t}</p>
                  <p className="s-body" style={{ marginTop: 8 }}>{h.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="uae" className="s-section" aria-labelledby="uae-h">
          <div className="s-wrap s-grid-2">
            <div>
              <p className="s-pill"><Flag market={india} size={12} /> to <Flag market={getMarket("ae")} size={12} /></p>
              <h2 id="uae-h" className="s-h2" style={{ marginTop: 16 }}>Sell from India to UAE</h2>
              <p className="s-lead" style={{ marginTop: 12 }}>
                Already selling with us from India? You can add the UAE later from your dashboard. No second account.
              </p>
              <p className="s-note" style={{ marginTop: 12 }}>{UAE_STATUS}.</p>
            </div>
            <ul className="s-list s-card">
              <li>Turn on UAE selling from your dashboard once your India account is approved.</li>
              <li>Set a separate AED price for each product you want to sell in the UAE.</li>
              <li>Sign a short UAE addendum with a code sent to your email.</li>
              <li>UAE sales are settled in AED, {SETTLEMENT_DAYS} days after delivery.</li>
            </ul>
          </div>
        </section>

        <section className="s-section" aria-labelledby="faq">
          <div className="s-wrap">
            <h2 id="faq" className="s-h2">Questions</h2>
            <div className="s-faq" style={{ marginTop: 24 }}>
              {FAQ.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="s-section" aria-labelledby="about">
          <div className="s-wrap s-grid-2">
            <div>
              <h2 id="about" className="s-h2">About NOTMADE</h2>
              <p className="s-lead" style={{ marginTop: 12 }}>
                NOTMADE is run by {LEGAL_NAME}, a DPIIT recognised startup.
              </p>
            </div>
            <div className="s-card">
              <p className="s-h3">Talk to us on WhatsApp</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
                {WHATSAPP.map(w => (
                  <li key={w.href} className="s-links">
                    <a href={w.href} target="_blank" rel="noopener noreferrer">{w.label}: {w.display}</a>
                  </li>
                ))}
                <li className="s-links"><a href={`mailto:${CONTACT_EMAIL}`}>Email: {CONTACT_EMAIL}</a></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="s-footer">
        <div className="s-wrap">
          <nav className="s-links" aria-label="Footer">
            <a href="/terms">Seller terms</a>
            <a href="/privacy-policy">Privacy policy</a>
            <a href="/refund-policy">Refund policy</a>
            <a href="https://notmade.in" target="_blank" rel="noopener noreferrer">notmade.in</a>
            <a href="/login">Log in</a>
          </nav>
          <p className="s-note" style={{ marginTop: 16 }}>&copy; {new Date().getFullYear()} {LEGAL_NAME}</p>
        </div>
      </footer>
    </div>
  );
}

function Hero({ market }: { market: Market }) {
  const isGlobal = market.code === "global";
  const storeHost = market.storeUrl?.replace(/^https?:\/\//, "");

  return (
    <section className="s-hero">
      <div className="s-wrap s-hero-grid">
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="s-pill"><Flag market={market} size={12} />{isGlobal ? "Outside India and UAE" : `Selling from ${market.name} in ${market.currency}`}</span>
            {market.code === "ae" && <span className="s-pill s-pill-red">{UAE_STATUS}</span>}
          </div>

          <h1 className="s-h1" style={{ marginTop: 20 }}>
            {isGlobal ? "More countries coming" : <>Sell on <span className="s-red">{storeHost}</span></>}
          </h1>

          <p className="s-lead" style={{ marginTop: 20, maxWidth: 540 }}>
            {market.code === "in" && `List your products on notmade.in, priced in INR. We deliver to your customers, answer their questions and handle returns. You are settled within ${SETTLEMENT_DAYS} days after each order is delivered.`}
            {market.code === "ae" && `List your products on uae.notmade.in, priced in AED. We deliver across the UAE and settle you in AED to your UAE bank account within ${SETTLEMENT_DAYS} days after each order is delivered.`}
            {isGlobal && "We are starting with India and the UAE. Leave your email and we will write to you when seller accounts open in your country."}
          </p>

          <div id="waitlist" style={{ marginTop: 28, scrollMarginTop: 96 }}>
            {market.open ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <a href={signupHref(market)} className="s-btn s-btn-red s-btn-lg">Create your seller account</a>
                <a href="/login" className="s-btn s-btn-line s-btn-lg">Log in</a>
              </div>
            ) : (
              <>
                <Waitlist market={market} />
                <p className="s-note" style={{ marginTop: 12 }}>{openMarketsSentence()}</p>
              </>
            )}
          </div>

          {market.code === "ae" && !market.open && (
            <p className="s-note" style={{ marginTop: 16 }}>
              Based in India? <a href="/?market=in#uae" style={{ color: "inherit", fontWeight: 600 }}>Create an India account and add the UAE later</a>.
            </p>
          )}
        </div>

        <div className="s-card">
          <p className="s-h3">{isGlobal ? "What we will need" : "What you need"}</p>
          <ul className="s-list" style={{ marginTop: 16 }}>
            {market.documents.map(d => <li key={d}>{d}</li>)}
          </ul>
          {market.delivery && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--s-line)" }}>
              <p className="s-h3">Delivery</p>
              <p className="s-body" style={{ marginTop: 6 }}>{market.delivery}</p>
            </div>
          )}
          {market.code === "in" && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--s-line)" }}>
              <p className="s-h3">Optional: sell in the UAE</p>
              <p className="s-body" style={{ marginTop: 6 }}>
                Add the UAE later from your dashboard with a separate AED price. <a href="#uae" style={{ color: "inherit", fontWeight: 600 }}>How it works</a>
              </p>
            </div>
          )}
          {market.payoutCurrency && (
            <p className="s-note" style={{ marginTop: 20 }}>Payouts in {market.payoutCurrency}, {SETTLEMENT_DAYS} days after delivery.</p>
          )}
        </div>
      </div>
    </section>
  );
}
