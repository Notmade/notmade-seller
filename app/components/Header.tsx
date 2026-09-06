"use client";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 28px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
              fontSize: 24, letterSpacing: "0.04em", color: "#1A1A1A",
            }}>NOTMADE</span>
          </a>

          {/* Desktop */}
          <div className="nav-desktop">
            <a href="#why" className="nav-link">How it works</a>
            <a href="#why" className="nav-link">Why NOTMADE</a>
            <a href="#apply" className="nav-link">FAQ</a>
            <a href="/login" className="nav-link" style={{ color: "#1A1A1A", fontWeight: 600 }}>LOGIN</a>
            <a href="#apply" style={{
              background: "#FF3B30", color: "#FFFFFF",
              fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
              fontSize: 15, letterSpacing: "0.08em",
              padding: "10px 22px", textDecoration: "none", display: "inline-block",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#cc2a20")}
              onMouseLeave={e => (e.currentTarget.style.background = "#FF3B30")}
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

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
          padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 0,
        }}>
          {["How it works|#why", "Why NOTMADE|#why", "FAQ|#apply", "LOGIN|/login"].map(item => {
            const [label, href] = item.split("|");
            return (
              <a key={label} href={href} onClick={() => setOpen(false)} style={{
                fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
                fontSize: 15, color: "#1A1A1A", textDecoration: "none",
                padding: "14px 0", borderBottom: "1px solid #F0F0F0", display: "block",
              }}>{label}</a>
            );
          })}
          <a href="#apply" onClick={() => setOpen(false)} style={{
            background: "#FF3B30", color: "#FFFFFF",
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
