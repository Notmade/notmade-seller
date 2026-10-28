import PublicPage from "../components/public/PublicPage";
import { Faq } from "../components/landing/parts";
import { ALL_FAQ, SELLER_FAQ } from "../landing/content/faq";
import { faqLd, metadataFor } from "../lib/seo";
import { SELLER_SUPPORT_EMAIL } from "../lib/currency";

export const metadata = metadataFor("faq");

export default function SellerFaq() {
  return (
    <PublicPage
      page="faq"
      kicker="Seller FAQ"
      title={<><span>Seller questions,</span><span className="red">answered.</span></>}
      lead={<p>Who can sell, the documents you need in India and the UAE, fees, payouts, returns, orders and listing. Something missing? Email <a href={`mailto:${SELLER_SUPPORT_EMAIL}`}>{SELLER_SUPPORT_EMAIL}</a>.</p>}
      jsonLd={[faqLd(ALL_FAQ)]}
    >
      <section className="n-sec n-sec-soft" aria-label="Questions">
        <div className="n-wrap n-faq-grid">
          <nav aria-label="FAQ topics" className="n-topics-nav">
            <p className="n-eyebrow">Topics</p>
            <ul className="n-topics">
              {SELLER_FAQ.map((g) => <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>)}
            </ul>
          </nav>
          <div>
            {SELLER_FAQ.map((g) => (
              <div key={g.id} id={g.id} className="n-faq-group">
                <h2>{g.title}</h2>
                <Faq items={g.items} open />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
