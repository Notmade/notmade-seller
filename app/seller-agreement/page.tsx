import PublicPage, { EntityDetails, Section } from "../components/public/PublicPage";
import { uaeRateSentence } from "../landing/content/faq";
import { AED } from "../lib/currency";
import { metadataFor } from "../lib/seo";
import {
  COMMISSION_PCT_INDIA, ENTITY_BY_COUNTRY, NOTICE_DAYS_INDIA, NOTICE_DAYS_UAE, PARTNER_CHANNEL_NOTICE_DAYS, RETURN_WINDOW_DAYS,
  SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, TERMINATION_SETTLEMENT_DAYS, UAE_RATE_CHANGE_NOTICE_DAYS,
} from "../lib/seller-config";

export const metadata = metadataFor("seller-agreement");

type Clause = { title: string; text: string };

// Summaries of the current agreements in the backend: in-v2 (India-based sellers) and uae-local-v2 (UAE-based sellers).
const INDIA: Clause[] = [
  { title: "Pricing", text: "You set and control the selling price of every product. NOTMADE does not set, mark up or change it." },
  { title: "Commission", text: `A flat commission on the selling price, inclusive of applicable taxes, on each confirmed and delivered order. The standard rate is ${COMMISSION_PCT_INDIA}%; your rate is filled in on the agreement you sign.` },
  { title: "Settlement", text: `Within ${PAYOUT_DAYS} days of confirmed delivery, by bank transfer to your registered account, after commission, GST on the commission, TDS and any return, cancellation, refund or chargeback adjustments. You get a statement for each settlement period.` },
  { title: "Fulfilment and invoices", text: "You are responsible for packaging and dispatch, accurate stock and product details, and issuing GST-compliant invoices to customers. NOTMADE runs the platform, payment processing and the customer-facing store." },
  { title: "Partner channels", text: `NOTMADE can list your products on its partner channels in India at your selling price, with the same commission. You can ask to be removed from a specific channel with ${PARTNER_CHANNEL_NOTICE_DAYS} days' notice.` },
  { title: "Returns", text: "You accept returns of defective, damaged, incorrect or misdescribed products under the platform's returns policy. Return logistics are at NOTMADE's cost for a platform error and at your cost for a product defect, misdescription or seller error." },
  { title: "Term and termination", text: `Either side can end the agreement with ${NOTICE_DAYS_INDIA} days' written notice. NOTMADE can end it at once for counterfeit or non-compliant products, fraud, repeated policy breaches or insolvency. Pending settlements are paid within ${TERMINATION_SETTLEMENT_DAYS} days.` },
  { title: "Liability", text: "NOTMADE's total liability is capped at the commission it earned from your products in the previous three months. You indemnify NOTMADE for claims arising from your products or a breach by you." },
  { title: "Signing", text: "You sign electronically in the seller panel with a one-time code sent to your email, together with your typed name." },
];

const UAE: Clause[] = [
  { title: "Pricing", text: `You list an ${AED} selling price for each product, including UAE VAT if you are VAT registered.` },
  { title: "Commission", text: `A commission on the ${AED} selling price of each confirmed and delivered UAE order, at the rate in force when the order is placed. ${uaeRateSentence()} NOTMADE gives at least ${UAE_RATE_CHANGE_NOTICE_DAYS} days' written notice of a rate change.` },
  { title: "Settlement", text: `Within ${PAYOUT_DAYS} days of confirmed delivery or of the close of the return window, whichever is later, by bank transfer to your registered IBAN, after commission, VAT on the commission and any adjustments. You get a settlement statement for UAE orders.` },
  { title: "Fulfilment and invoices", text: "You keep products ready for dispatch within the lead time shown on the platform, pack them securely and work with NOTMADE's logistics partners in the UAE. If you are VAT registered you issue VAT-compliant tax invoices." },
  { title: "Returns", text: `Customers can claim within ${RETURN_WINDOW_DAYS} days of delivery, only with an unboxing video. NOTMADE reviews the video and decides. Approved claims from a defect, misdescription or seller error are at your cost; transit damage or a platform error is at NOTMADE's.` },
  { title: "Trade licence", text: "You must hold a valid UAE trade licence for the whole term and tell NOTMADE promptly about any change, suspension or expiry." },
  { title: "Opt-out and termination", text: `You can stop selling in the UAE with ${NOTICE_DAYS_UAE} days' written notice. NOTMADE can end the agreement at once for counterfeit or non-compliant products, fraud, repeated policy breaches, a lapsed trade licence or insolvency. Pending settlements are paid within ${TERMINATION_SETTLEMENT_DAYS} days.` },
  { title: "Liability", text: "NOTMADE's total liability is capped at the commission it earned from your products in the previous three months. You indemnify NOTMADE for claims arising from your products or a breach by you." },
  { title: "Signing", text: "You sign electronically in the seller panel with a one-time code sent to your email, together with your typed name." },
];

const COUNTRIES = [
  { id: "india", name: "India", eyebrow: "India-based sellers", agreement: "NOTMADE Seller Agreement, India-based seller terms", entity: ENTITY_BY_COUNTRY.IN, clauses: INDIA, href: "/sell-in-india" },
  { id: "uae", name: "the UAE", eyebrow: "UAE-based sellers", agreement: "NOTMADE Seller Agreement — UAE, UAE-based seller terms", entity: ENTITY_BY_COUNTRY.AE, clauses: UAE, href: "/sell-in-uae" },
];

export default function SellerAgreement() {
  return (
    <PublicPage
      page="seller-agreement"
      kicker="Seller agreement"
      title={<><span>The agreement,</span><span className="red">summarised.</span></>}
      lead={<p>You sign one agreement, for the country your business is based in. This is a summary to help you decide; it is not the agreement. The full text, with your details and rate filled in, is shown in the seller panel before you sign.</p>}
    >
      {COUNTRIES.map((c, i) => (
        <Section key={c.id} id={c.id} eyebrow={c.eyebrow} title={`Selling in ${c.name}.`} soft={i === 0}>
          <div className="n-cols">
            <div className="n-card n-prose">
              <h3 style={{ marginTop: 0 }}>Key terms</h3>
              {c.clauses.map((cl) => <p key={cl.title}><strong>{cl.title}.</strong> {cl.text}</p>)}
            </div>
            <div className="n-card">
              <h3>Who you contract with</h3>
              <EntityDetails entity={c.entity} agreement={c.agreement} />
              <p className="n-more"><a href={c.href}>Sell in {c.name}</a></p>
            </div>
          </div>
        </Section>
      ))}
    </PublicPage>
  );
}
