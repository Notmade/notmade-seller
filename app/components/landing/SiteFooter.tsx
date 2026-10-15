import { CONTACT_EMAIL } from "../../lib/seller-config";
import type { Cta } from "@/app/landing/content/types";

export default function SiteFooter({ login, primary }: { login: Cta; primary: Cta }) {
  const cols = [
    { title: "Sell", links: [primary, login, { label: "How it works", href: "#how" }, { label: "Commission", href: "#commission" }] },
    { title: "Support", links: [{ label: "FAQ", href: "#faq" }, { label: "Returns", href: "#returns" }, { label: "Email us", href: `mailto:${CONTACT_EMAIL}` }] },
    { title: "Legal", links: [{ label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy-policy" }, { label: "Refunds", href: "/refund-policy" }] },
  ];
  return (
    <footer className="n-foot">
      <div className="n-wrap">
        <div className="n-foot-grid">
          <div className="n-foot-brand">
            <a href="/" className="n-logo n-logo-inv" aria-label="NOTMADE Seller home">NOT<span>MADE</span><small>Seller</small></a>
            <p>Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="n-foot-col">
              <h2>{c.title}</h2>
              <ul>{c.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <p className="n-foot-copy">© House of Notmade Studio</p>
      </div>
    </footer>
  );
}
