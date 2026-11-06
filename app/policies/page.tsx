import PublicPage, { Section } from "../components/public/PublicPage";
import { getPage, type PageKey } from "../lib/public-pages";
import { metadataFor } from "../lib/seo";
import { MIN_PRODUCTS, PARTNER_CHANNEL_NOTICE_DAYS, RETURN_WINDOW_DAYS } from "../lib/seller-config";

export const metadata = metadataFor("policies");

// From the seller terms (quality standards) and the India and UAE seller agreements.
const POLICIES: { id: string; title: string; points: string[] }[] = [
  {
    id: "quality",
    title: "Product quality and authenticity",
    points: [
      "Every product must be original, genuine and authentic.",
      "Products must match their description, photos and specifications.",
      "Products must comply with the law of the country you sell in, including consumer protection, labelling and product safety rules.",
      `In India you need at least ${MIN_PRODUCTS} products to go live.`,
      "NOTMADE can remove a listing that does not meet its quality standards, and tells you why.",
    ],
  },
  {
    id: "not-allowed",
    title: "What ends a seller account",
    points: [
      "Supplying counterfeit, prohibited or non-compliant products.",
      "Fraud or misrepresentation.",
      "Repeatedly breaking platform policies.",
      "In the UAE, no longer holding a valid trade licence.",
    ],
  },
  {
    id: "orders",
    title: "Orders and stock",
    points: [
      "Accept an order only if you can fulfil it; reject it if you cannot.",
      "Keep stock levels accurate in your panel so orders are not oversold or cancelled.",
      "Pack orders securely and give accurate weights, dimensions and packaging details.",
      "Tell NOTMADE at once about any recall, quality defect or legal issue affecting your products.",
    ],
  },
  {
    id: "returns",
    title: "Returns",
    points: [
      `Customers can raise a return within ${RETURN_WINDOW_DAYS} days of delivery, only with an unboxing video.`,
      "You can watch the unboxing video from the order in your panel.",
      "Returns caused by a product defect, a wrong description or a seller error are at the seller's cost.",
      "Returns caused by a platform error, or by transit damage in the UAE, are at NOTMADE's cost.",
    ],
  },
  {
    id: "content",
    title: "Your product content",
    points: [
      "You keep ownership of your products, designs and brand.",
      "You give NOTMADE a non-exclusive, royalty-free licence to use your product images, descriptions, brand names and logos to list, promote and sell your products.",
      `In India, NOTMADE can list your products on partner channels at your selling price. You can ask for removal from a specific channel with ${PARTNER_CHANNEL_NOTICE_DAYS} days' written notice.`,
    ],
  },
];

const DOCS: PageKey[] = ["seller-agreement", "terms", "refund-policy", "privacy-policy"];

export default function Policies() {
  return (
    <PublicPage
      page="policies"
      kicker="Seller policies"
      title={<><span>The rules,</span><span className="red">in plain English.</span></>}
      lead={<p>What NOTMADE expects from every seller in India and the UAE. Your signed seller agreement is the binding text; these pages summarise it.</p>}
    >
      <Section id="policies" eyebrow="Policies" title="Selling on NOTMADE." soft>
        <div className="n-cols">
          {POLICIES.map((p) => (
            <div key={p.id} id={p.id} className="n-card">
              <h3>{p.title}</h3>
              <ul>{p.points.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="documents" eyebrow="Documents" title="Read the full text.">
        <ul className="n-links">
          {DOCS.map((k) => {
            const p = getPage(k);
            return <li key={k}><a href={p.path}><strong>{p.name}</strong><span>{p.description}</span></a></li>;
          })}
        </ul>
      </Section>
    </PublicPage>
  );
}
