"use client";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed wrapper: announcement bar + nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>

        {/* Announcement bar */}
        <div style={{
          background: "#CC0000", color: "#FFFFFF",
          textAlign: "center", fontSize: 13,
          padding: "9px 28px",
          fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
          letterSpacing: "0.02em", lineHeight: 1,
        }}>
          India&apos;s culture-first marketplace for independent sellers
        </div>

        {/* Nav */}
        <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E0E0E0" }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 28px",
            height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>

            {/* Logo */}
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: 22, letterSpacing: "0.04em", color: "#1A1A1A",
              }}>NOTMADE</span>
              <span style={{
                background: "#CC0000", color: "#FFFFFF",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 8px", borderRadius: 100,
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                lineHeight: 1,
              }}>SELLER</span>
            </a>

            {/* Desktop nav */}
            <div className="nav-desktop">
              <a href="#why" className="nav-link">Why NOTMADE</a>
              <a href="#how" className="nav-link">How it Works</a>
              <a href="#apply" className="nav-link">FAQ</a>
              <a
                href="/login"
                className="nav-login-btn"
                style={{
                  fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
                  color: "#1A1A1A", textDecoration: "none",
                  padding: "9px 20px",
                  border: "1.5px solid #1A1A1A",
                  background: "transparent",
                  display: "inline-block",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A1A"; }}
              >LOGIN</a>
              <a
                href="/login"
                style={{
                  background: "#CC0000", color: "#FFFFFF",
                  fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                  fontSize: 15, letterSpacing: "0.08em",
                  padding: "10px 22px", textDecoration: "none", display: "inline-block",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#aa0000")}
                onMouseLeave={e => (e.currentTarget.style.background = "#CC0000")}
              >START SELLING →</a>
            </div>

            {/* Hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
            >
              <div style={{ width: 22, height: 2, background: "#1A1A1A", marginBottom: 5, transition: "transform 0.2s", transform: open ? "rotate(45deg) translateY(7px)" : "none" }} />
              <div style={{ width: 22, height: 2, background: "#1A1A1A", marginBottom: 5, opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
              <div style={{ width: 22, height: 2, background: "#1A1A1A", transition: "transform 0.2s", transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu — drops below full header (36px bar + 64px nav = 100px) */}
      {open && (
        <div style={{
          position: "fixed", top: 100, left: 0, right: 0, zIndex: 99,
          background: "#FFFFFF", borderBottom: "1px solid #E0E0E0",
          padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 0,
        }}>
          {["Why NOTMADE|#why", "How it Works|#how", "FAQ|#apply", "LOGIN|/login"].map(item => {
            const [label, href] = item.split("|");
            return (
              <a key={label} href={href} onClick={() => setOpen(false)} style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 15, color: "#1A1A1A", textDecoration: "none",
                padding: "14px 0", borderBottom: "1px solid #F0F0F0", display: "block",
              }}>{label}</a>
            );
          })}
          <a href="/login" onClick={() => setOpen(false)} style={{
            background: "#CC0000", color: "#FFFFFF",
            fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
            fontSize: 16, letterSpacing: "0.08em",
            padding: "16px", textDecoration: "none", textAlign: "center",
            display: "block", marginTop: 16,
          }}>START SELLING →</a>
        </div>
      )}
    </>
  );
}
