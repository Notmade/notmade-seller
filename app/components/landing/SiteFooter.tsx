import { CONTACT_EMAIL } from "../../lib/seller-config";
import type { Cta, ModeCode } from "@/app/landing/content/types";

export default function SiteFooter({ code, entity, login, primary, links }: {
  code?: ModeCode; entity: string; login: Cta; primary: Cta; links: Cta[];
}) {
  const legal = (page: string) => (code === "ae" ? `/uae/${page}` : `/${page}`);
  const cols = [
    { title: "Sell", links: [primary, login, ...links] },
    { title: "Support", links: [
      { label: "FAQ", href: code ? "#faq" : "/faq" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Fees and payouts", href: "/fees-and-payouts" },
      { label: "Seller policies", href: "/policies" },
      { label: "Agreement summary", href: "/seller-agreement" },
      { label: "Contact", href: "/contact" },
    ] },
    { title: "Legal", links: [{ label: "Terms", href: legal("terms") }, { label: "Privacy", href: legal("privacy-policy") }, { label: "Refunds", href: legal("refund-policy") }] },
  ];
  return (
    <footer className="n-foot">
      <div className="n-wrap">
        <div className="n-foot-grid">
          <div className="n-foot-brand">
            <a href={code === "ae" ? "/uae" : "/"} className="n-logo n-logo-inv" aria-label="NOTMADE Seller home">NOT<span>MADE</span><small>Seller</small></a>
            <p>Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="n-foot-col">
              <h2>{c.title}</h2>
              <ul>{c.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <p className="n-foot-copy">© {entity}</p>
      </div>
    </footer>
  );
}
