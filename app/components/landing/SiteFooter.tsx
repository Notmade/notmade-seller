import { CONTACT_EMAIL } from "../../lib/seller-config";
import { getPage, type PageKey } from "../../lib/public-pages";
import type { Cta } from "@/app/landing/content/types";

const link = (key: PageKey, label?: string): Cta => ({ label: label ?? getPage(key).name, href: getPage(key).path });

export default function SiteFooter({ login, primary }: { login: Cta; primary: Cta }) {
  const cols = [
    { title: "Sell", links: [primary, login, link("sell-in-india"), link("sell-in-uae"), link("how-it-works")] },
    { title: "Support", links: [link("faq"), link("fees-and-payouts"), link("contact"), { label: "Email us", href: `mailto:${CONTACT_EMAIL}` }] },
    { title: "Legal", links: [link("policies"), link("seller-agreement", "Agreement summary"), link("terms", "Terms"), link("privacy-policy", "Privacy"), link("refund-policy", "Refunds")] },
  ];
  return (
    <footer className="n-foot">
      <div className="n-wrap">
        <div className="n-foot-grid">
          <div className="n-foot-brand">
            <a href="/" className="n-logo n-logo-inv">NOT<span>MADE</span><small>Seller</small><span className="n-sr"> home</span></a>
            <p>Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="n-foot-col">
              <h2>{c.title}</h2>
              <ul>{c.links.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <p className="n-foot-copy">© House of Notmade Studio</p>
      </div>
    </footer>
  );
}
