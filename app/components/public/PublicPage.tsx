import "../landing/landing.css";
import SiteHeader from "../landing/SiteHeader";
import SiteFooter from "../landing/SiteFooter";
import JsonLd from "./JsonLd";
import type { Cta } from "@/app/landing/content/types";
import type { PageKey } from "@/app/lib/public-pages";
import { breadcrumbLd, crumbsFor, organizationLd, websiteLd } from "@/app/lib/seo";
import type { Entity } from "@/app/lib/seller-config";

export const START: Cta = { label: "Start selling", href: "/login?apply=1" };
export const LOGIN: Cta = { label: "Log in", href: "/login" };

/**
 * Shell for every public content page: header, visible breadcrumb, one <h1> hero, footer, and the
 * Organization, WebSite and BreadcrumbList JSON-LD. Pages pass any extra JSON-LD (FAQPage, WebPage).
 */
export default function PublicPage({ page, kicker, title, lead, actions, jsonLd = [], primary = START, login = LOGIN, children }: {
  page: PageKey;
  kicker: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  actions?: React.ReactNode;
  jsonLd?: unknown[];
  primary?: Cta;
  login?: Cta;
  children: React.ReactNode;
}) {
  const crumbs = crumbsFor(page);
  return (
    <div className="n">
      <a href="#main" className="n-skip">Skip to content</a>
      <SiteHeader login={login} primary={primary} />
      <JsonLd data={[organizationLd(), websiteLd(), breadcrumbLd(crumbs), ...jsonLd]} />

      <main id="main">
        <nav aria-label="Breadcrumb" className="n-wrap n-crumbs">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.path}>{i < crumbs.length - 1 ? <a href={c.path}>{c.name}</a> : <span aria-current="page">{c.name}</span>}</li>
            ))}
          </ol>
        </nav>
        <section className="n-page-hero">
          <div className="n-wrap">
            <p className="n-kicker">{kicker}</p>
            <h1 className="n-h1 n-h1-page">{title}</h1>
            <div className="n-lead">{lead}</div>
            {actions && <div className="n-cta">{actions}</div>}
          </div>
        </section>
        {children}
      </main>

      <SiteFooter login={login} primary={primary} />
    </div>
  );
}

/** A content section with eyebrow, h2 and optional intro. Alternate `soft` for the grey band. */
export function Section({ id, eyebrow, title, sub, soft, children }: {
  id: string; eyebrow: string; title: string; sub?: React.ReactNode; soft?: boolean; children?: React.ReactNode;
}) {
  return (
    <section className={soft ? "n-sec n-sec-soft" : "n-sec"} id={id} aria-labelledby={`${id}-h`}>
      <div className="n-wrap">
        <p className="n-eyebrow">{eyebrow}</p>
        <h2 id={`${id}-h`} className="n-h2">{title}</h2>
        {sub && <p className="n-sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}

/** Company a seller contracts with, as a definition list. */
export function EntityDetails({ entity, agreement }: { entity: Entity; agreement: string }) {
  return (
    <dl className="n-dl">
      <div><dt>Company</dt><dd>{entity.name}</dd></div>
      {entity.ids.map((id) => <div key={id.label}><dt>{id.label}</dt><dd>{id.value}</dd></div>)}
      <div><dt>Registered office</dt><dd>{entity.registeredOffice}</dd></div>
      <div><dt>Phone</dt><dd><a href={`tel:${entity.phone.replace(/\s/g, "")}`}>{entity.phone}</a></dd></div>
      <div><dt>Store</dt><dd><a href={entity.store}>{entity.store.replace(/^https?:\/\//, "")}</a></dd></div>
      <div><dt>Agreement</dt><dd>{agreement}</dd></div>
      <div><dt>Governing law</dt><dd>{entity.law}</dd></div>
    </dl>
  );
}
