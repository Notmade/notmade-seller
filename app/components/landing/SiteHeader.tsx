"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MODES, type ModeCode } from "@/app/landing/content";
import type { Cta } from "@/app/landing/content/types";
import { NAV, getPage } from "@/app/lib/public-pages";

const LINKS = NAV.map(({ key, label }) => ({ href: getPage(key).path, label }));

export function MarketSwitch({ value, onChange }: { value: ModeCode; onChange: (c: ModeCode) => void }) {
  return (
    <div className="n-switch" role="group" aria-label="Market">
      {MODES.map((m) => (
        <button key={m.code} type="button" aria-pressed={m.code === value} onClick={() => onChange(m.code)}>
          {m.label}
        </button>
      ))}
    </div>
  );
}

/** Public site header. The market switch shows only where the page can switch market in place (the landing). */
export default function SiteHeader({ code, onMarket, login, primary }: {
  code?: ModeCode; onMarket?: (c: ModeCode) => void; login: Cta; primary: Cta;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const wide = window.matchMedia("(min-width: 960px)");
    const resize = () => { if (wide.matches) setOpen(false); };
    document.addEventListener("keydown", key);
    wide.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", key); wide.removeEventListener("change", resize); };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`n-head${scrolled || open ? " is-raised" : ""}`}>
      <div className="n-wrap n-head-row">
        <a href={code ? `/?market=${code}` : "/"} className="n-logo">
          NOT<span>MADE</span><small>Seller</small><span className="n-sr"> home</span>
        </a>

        <nav className="n-head-nav" aria-label="Main">
          {LINKS.map((l) => <a key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</a>)}
        </nav>

        <div className="n-head-end">
          {code && onMarket && <MarketSwitch value={code} onChange={onMarket} />}
          <a href={login.href} className="n-head-login">{login.label}</a>
          <a href={primary.href} className="n-btn n-btn-red n-btn-sm n-head-cta">{primary.label}</a>
          <button type="button" className="n-menu-btn" aria-expanded={open} aria-controls="n-menu"
            aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            <span aria-hidden className={open ? "n-burger x" : "n-burger"}><i /><i /></span>
          </button>
        </div>
      </div>

      <div id="n-menu" className="n-menu" hidden={!open}>
        <nav className="n-wrap" aria-label="Menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</a>
          ))}
          <div className="n-menu-cta">
            <a href={primary.href} className="n-btn n-btn-red" onClick={close}>{primary.label}</a>
            <a href={login.href} className="n-btn n-btn-line" onClick={close}>{login.label}</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
