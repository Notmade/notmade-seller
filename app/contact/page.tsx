import PublicPage, { EntityDetails, Section } from "../components/public/PublicPage";
import { SELLER_SUPPORT_EMAIL } from "../lib/currency";
import { metadataFor } from "../lib/seo";
import { CONTACT_EMAIL, ENTITY_BY_COUNTRY, INSTAGRAM_URL } from "../lib/seller-config";

export const metadata = metadataFor("contact");

const tel = (p: string) => `tel:${p.replace(/\s/g, "")}`;

export default function Contact() {
  const ways = [
    { title: "Seller support", text: "Questions about selling, your account, orders, payouts or UAE access.", href: `mailto:${SELLER_SUPPORT_EMAIL}`, label: SELLER_SUPPORT_EMAIL },
    { title: "Agreements and notices", text: "Written notices under your seller agreement, disputes and data requests.", href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
    { title: "Phone, India", text: "For India-based sellers.", href: tel(ENTITY_BY_COUNTRY.IN.phone), label: ENTITY_BY_COUNTRY.IN.phone },
    { title: "Phone, UAE", text: "For UAE-based sellers.", href: tel(ENTITY_BY_COUNTRY.AE.phone), label: ENTITY_BY_COUNTRY.AE.phone },
  ];
  return (
    <PublicPage
      page="contact"
      kicker="Contact"
      title={<><span>Talk to</span><span className="red">the seller team.</span></>}
      lead={<p>Questions about selling on NOTMADE in India or the UAE? Email or call us, or read the <a href="/faq">seller FAQ</a> first.</p>}
    >
      <Section id="reach" eyebrow="Reach us" title="Email and phone." soft>
        <ul className="n-links">
          {ways.map((w) => <li key={w.title}><a href={w.href}><strong>{w.title}</strong><span>{w.text}</span><span>{w.label}</span></a></li>)}
          <li><a href={INSTAGRAM_URL}><strong>Instagram</strong><span>Follow NOTMADE.</span><span>{INSTAGRAM_URL.replace(/^https?:\/\//, "")}</span></a></li>
        </ul>
      </Section>

      <Section id="offices" eyebrow="Registered offices" title="Our companies.">
        <div className="n-cols">
          <div className="n-card"><h3>India</h3><EntityDetails entity={ENTITY_BY_COUNTRY.IN} agreement="NOTMADE Seller Agreement, India-based seller terms" /></div>
          <div className="n-card"><h3>United Arab Emirates</h3><EntityDetails entity={ENTITY_BY_COUNTRY.AE} agreement="NOTMADE Seller Agreement — UAE, UAE-based seller terms" /></div>
        </div>
      </Section>
    </PublicPage>
  );
}
