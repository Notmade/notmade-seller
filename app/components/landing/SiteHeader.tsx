"use client";

import { useEffect, useState } from "react";
import type { Cta, ModeCode } from "@/app/landing/content/types";

export interface Section { id: string; label: string }

/** Current country and a way to change it. Only /country names both, so neither landing page does. */
export function CountrySwitch({ value }: { value: ModeCode }) {
  return (
    <nav className="n-switch" aria-label="Country" data-country-switch>
      <span aria-current="true">{value === "ae" ? "UAE" : "India"}</span>
      <a href="/country">Change country</a>
    </nav>
  );
}

export default function SiteHeader({ code, sections, login, primary }: {
  code: ModeCode; sections: Section[]; login: Cta; primary: Cta;
}) {
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
        <a href={code === "ae" ? "/uae" : "/?market=in"} className="n-logo" aria-label="NOTMADE Seller home">
          NOT<span>MADE</span><small>Seller</small>
        </a>

        <nav className="n-head-nav" aria-label="Sections">
          {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
        </nav>

        <div className="n-head-end">
          <CountrySwitch value={code} />
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
          {sections.map((s) => <a key={s.id} href={`#${s.id}`} onClick={close}>{s.label}</a>)}
          <div className="n-menu-cta">
            <a href={primary.href} className="n-btn n-btn-red" onClick={close}>{primary.label}</a>
            <a href={login.href} className="n-btn n-btn-line" onClick={close}>{login.label}</a>
            <a href="/country" className="n-btn n-btn-line" onClick={close}>Change country</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
