import PublicPage, { Section } from "../components/public/PublicPage";
import { getMode } from "../landing/content";
import { metadataFor } from "../lib/seo";
import { REVIEW_HOURS } from "../lib/seller-config";

export const metadata = metadataFor("how-it-works");

const COUNTRIES = [
  { mode: getMode("in"), href: "/sell-in-india", name: "India" },
  { mode: getMode("ae"), href: "/sell-in-uae", name: "the UAE" },
];

export default function HowItWorks() {
  return (
    <PublicPage
      page="how-it-works"
      kicker="How it works"
      title={<><span>From sign-up</span><span className="red">to payout.</span></>}
      lead={<p>Everything happens in one seller panel: sign up with an email code, add your documents, sign the agreement, list products, accept orders and get paid. The steps differ a little between India and the UAE.</p>}
    >
      <Section id="steps" eyebrow="Step by step" title="The steps, by country." soft
        sub={`After you sign the agreement, our team reviews your account, usually within ${REVIEW_HOURS} hours.`}>
        <div className="n-cols">
          {COUNTRIES.map(({ mode, href, name }) => (
            <div key={mode.code} className="n-card">
              <h3>Selling in {name}</h3>
              <p>{mode.steps.sub}</p>
              <ol>
                {mode.steps.items.map((s) => <li key={s.title}><strong>{s.title}.</strong> {s.desc}</li>)}
              </ol>
              <p className="n-more"><a href={href}>Sell in {name}: documents, fees and delivery</a></p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="orders" eyebrow="Every order" title="Accept, pack, mark ready."
        sub="New orders wait in your panel. Accept an order if you can fulfil it, reject it if you cannot. Pack it, mark it ready, and it goes out with the courier.">
        <div className="n-cols">
          {COUNTRIES.map(({ mode, name }) => (
            <div key={mode.code} className="n-card">
              <h3>Delivery in {name}</h3>
              <ul>{mode.delivery.items.map((f) => <li key={f.label}><strong>{f.label}:</strong> {f.value}{f.note ? `. ${f.note}.` : "."}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="n-more"><a href="/fees-and-payouts">When payouts are made</a></p>
      </Section>
    </PublicPage>
  );
}
