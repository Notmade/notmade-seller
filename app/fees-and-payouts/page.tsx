import PublicPage, { Section } from "../components/public/PublicPage";
import RateCalculator from "../components/public/RateCalculator";
import { getMode } from "../landing/content";
import { uaeRateSentence } from "../landing/content/faq";
import { AED, INR } from "../lib/currency";
import { metadataFor } from "../lib/seo";
import {
  COMMISSION_PCT_INDIA, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS_AFTER_DELIVERY as PAYOUT_DAYS, UAE_RATE_CHANGE_NOTICE_DAYS,
} from "../lib/seller-config";

export const metadata = metadataFor("fees-and-payouts");

// India column: in-v2 and the seller terms. UAE column: uae-local-v2 and the UAE landing copy.
const ROWS: { label: string; india: string; uae: string }[] = [
  {
    label: "Commission",
    india: `A flat commission on the selling price, inclusive of applicable taxes, of each confirmed and delivered order. The standard India rate is ${COMMISSION_PCT_INDIA}%; your exact rate is in your agreement before you sign.`,
    uae: `A commission on the ${AED} selling price of each confirmed and delivered order. ${uaeRateSentence()}`,
  },
  {
    label: "Other fees",
    india: "No listing fee, no setup fee and no monthly subscription.",
    uae: "Any fees beyond commission are shared during onboarding.",
  },
  {
    label: "Selling price",
    india: `Set by you, in ${INR}. NOTMADE does not change it.`,
    uae: `Set by you, in ${AED}, including VAT if you are VAT registered. NOTMADE does not change it.`,
  },
  {
    label: "Deducted from a settlement",
    india: "Commission, GST on the commission, TDS where it applies, and adjustments for returns, cancellations, refunds or chargebacks.",
    uae: "Commission, VAT on the commission where it applies, and adjustments for returns, cancellations, refunds or chargebacks.",
  },
  {
    label: "When you are paid",
    india: `Within ${PAYOUT_DAYS} days of confirmed delivery to the customer.`,
    uae: `Within ${PAYOUT_DAYS} days after the ${RETURN_WINDOW_DAYS}-day return window closes.`,
  },
  {
    label: "Where it is paid",
    india: "By bank transfer to the bank account registered on your seller profile.",
    uae: "By bank transfer to the UAE IBAN on your seller profile, in the settlement currency agreed with you.",
  },
  {
    label: "Statements",
    india: "A settlement statement for each settlement period, and every order listed in Payouts in your panel.",
    uae: "A settlement statement showing the selling price, commission rate and amount, and the amount paid.",
  },
  {
    label: "Returns after a payout",
    india: "The amount can be adjusted or recovered from your next settlement.",
    uae: "Approved claims you are responsible for can be adjusted against your settlements.",
  },
  {
    label: "Rate changes",
    india: "NOTMADE gives reasonable notice of any material change to the commission structure.",
    uae: `At least ${UAE_RATE_CHANGE_NOTICE_DAYS} days' written notice. Orders placed before the change keep the rate recorded on the order.`,
  },
];

export default function FeesAndPayouts() {
  const india = getMode("in");
  const uae = getMode("ae");
  return (
    <PublicPage
      page="fees-and-payouts"
      kicker="Fees and payouts"
      title={<><span>What it costs,</span><span className="red">when you&apos;re paid.</span></>}
      lead={<p>NOTMADE earns a commission on each delivered order. Here is what is charged, what is deducted from a settlement and when payouts reach your bank, for India and the UAE.</p>}
    >
      <Section id="compare" eyebrow="India and UAE" title="Fees at a glance." soft
        sub="The agreement you sign in the panel is the binding text and shows your exact rate.">
        <div className="n-table-wrap">
          <table className="n-table">
            <thead><tr><th scope="col">Item</th><th scope="col">India</th><th scope="col">UAE</th></tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td data-label="India">{r.india}</td>
                  <td data-label="UAE">{r.uae}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="calculator" eyebrow="Calculator" title="Work out a payout."
        sub="Enter a selling price to see the commission and what you receive. Rates load live from NOTMADE; taxes on the commission and any adjustments are not included.">
        <div className="n-cols">
          <div><h3 className="n-card-title">India</h3><RateCalculator calc={india.money.calc} /></div>
          <div><h3 className="n-card-title">UAE</h3><RateCalculator calc={uae.money.calc} /></div>
        </div>
        <p className="n-more"><a href="/faq#fees">Fee questions</a></p>
      </Section>
    </PublicPage>
  );
}
