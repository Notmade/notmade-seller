import PublicPage, { Section } from "../components/public/PublicPage";
import india from "../landing/content/in";
import uae from "../landing/content/ae";
import { getMarket } from "@/src/config/markets";
import { metadataFor } from "../lib/seo";

export const metadata = metadataFor("how-it-works");

const COUNTRIES = [
  { content: india, market: getMarket("in"), href: "/", name: "India" },
  { content: uae, market: getMarket("ae"), href: "/uae", name: "the UAE" },
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
        sub="Your account is active as soon as you sign the agreement. NOTMADE reviews each product before it goes live.">
        <div className="n-cols">
          {COUNTRIES.map(({ content, href, name }) => (
            <div key={content.code} className="n-card">
              <h3>Selling in {name}</h3>
              <p>{content.steps.sub}</p>
              <ol>
                {content.steps.items.map((s) => <li key={s.title}><strong>{s.title}.</strong> {s.desc}</li>)}
              </ol>
              <p className="n-more"><a href={href}>More about {name}</a></p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="orders" eyebrow="Every order" title="Accept, pack, mark ready."
        sub="New orders wait in your panel. Accept an order if you can fulfil it, reject it if you cannot. Pack it, mark it ready, and it goes out with the courier.">
        <div className="n-cols">
          {COUNTRIES.map(({ content, market, name }) => (
            <div key={content.code} className="n-card">
              <h3>Delivery in {name}</h3>
              <p>{market.delivery}.</p>
            </div>
          ))}
        </div>
        <p className="n-more"><a href="/fees-and-payouts">When payouts are made</a></p>
      </Section>
    </PublicPage>
  );
}
