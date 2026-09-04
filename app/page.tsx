import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

/* ── Static data ── */

const REASONS = [
  {
    num: "01",
    title: "BETTER COMMISSION, ALWAYS",
    desc: "We built this from scratch — no legacy overhead, no VC pressure. Better margins for you, period.",
    accent: "#FF3B30",
  },
  {
    num: "02",
    title: "7-DAY PAYOUTS. NO DRAMA.",
    desc: "Cash flow kills brands. We pay out within 7 days of delivery. Not 30. Not 45. Seven.",
    accent: "#C8F542",
  },
  {
    num: "03",
    title: "YOUR CUSTOMERS, YOUR DATA",
    desc: "Get access to your buyer database at nominal cost. Know who bought, when, and what they loved.",
    accent: "#FF3B30",
  },
  {
    num: "04",
    title: "VISIBILITY THAT CONVERTS",
    desc: "Curated placement, not a crowded marketplace. Your product gets seen by the right people.",
    accent: "#C8F542",
  },
  {
    num: "05",
    title: "GOING INTERNATIONAL",
    desc: "We're building toward GCC and Southeast Asia. Your brand travels with us.",
    accent: "#FF3B30",
  },
];

const STEPS = [
  {
    num: "01",
    title: "FILL THE FORM",
    desc: "Takes 2 minutes. Tell us about your brand and what you make.",
  },
  {
    num: "02",
    title: "WE CONNECT",
    desc: "Our team reaches out within 48 hours. No automated emails. A real conversation.",
  },
  {
    num: "03",
    title: "GO LIVE",
    desc: "Listing done by us, you just ship. We handle the rest.",
  },
];

const TICKER_ITEMS = [
  "7-DAY PAYOUTS",
  "BETTER MARGINS",
  "PAN INDIA DELIVERY",
  "CURATED PLACEMENT",
  "YOUR CUSTOMER DATA",
  "GOING INTERNATIONAL",
  "7-DAY PAYOUTS",
  "BETTER MARGINS",
  "PAN INDIA DELIVERY",
  "CURATED PLACEMENT",
  "YOUR CUSTOMER DATA",
  "GOING INTERNATIONAL",
];

/* ── Sub-components ── */

function Logo() {
  return (
    <span
      style={{
        fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
        fontSize: "1.6rem",
        letterSpacing: "0.04em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <span style={{ color: "#E8E4DC" }}>NOT</span>
      <span style={{ color: "#FF3B30" }}>MADE</span>
    </span>
  );
}

function DividerDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "#FF3B30",
        margin: "0 20px",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}

/* ── Page ── */

export default function Home() {
  return (
    <main style={{ background: "#0B0B0C", minHeight: "100vh" }}>

      {/* ════ NAV ════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(11,11,12,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="/login"
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontWeight: 500,
                color: "rgba(232,228,220,0.5)",
                textDecoration: "none",
                letterSpacing: "0.02em",
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              Login
            </a>
            <a
              href="#apply"
              className="btn-primary"
              style={{
                fontSize: "15px",
                padding: "10px 22px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              APPLY TO SELL
            </a>
          </div>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section
        style={{
          paddingTop: 64,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            pointerEvents: "none",
          }}
        />
        {/* Red glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            background: "radial-gradient(ellipse, rgba(255,59,48,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 28px 60px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Label */}
          <AnimatedSection>
            <div style={{ marginBottom: "2rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,59,48,0.1)",
                  border: "1px solid rgba(255,59,48,0.3)",
                  borderRadius: 100,
                  padding: "6px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#FF3B30",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#FF3B30",
                    display: "inline-block",
                  }}
                />
                SELLER PROGRAMME — NOW ACCEPTING
              </span>
            </div>
          </AnimatedSection>

          {/* Heading */}
          <AnimatedSection delay={60}>
            <h1
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(4.5rem, 13vw, 140px)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "0.02em",
                color: "#E8E4DC",
                marginBottom: "2rem",
                maxWidth: 900,
              }}
            >
              BUILT FOR SELLERS
              <br />
              WHO MEAN{" "}
              <span style={{ color: "#FF3B30" }}>BUSINESS.</span>
            </h1>
          </AnimatedSection>

          {/* Subtext */}
          <AnimatedSection delay={100}>
            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "rgba(232,228,220,0.6)",
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: "2.5rem",
              }}
            >
              Not another marketplace. A platform that actually gives a damn
              about your cash flow, your customers, and your growth.
            </p>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection delay={140}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <a
                href="#apply"
                className="btn-primary"
                style={{
                  fontSize: "18px",
                  padding: "16px 40px",
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                APPLY TO SELL →
              </a>
              <a
                href="#why"
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: "14px",
                  color: "#C8F542",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: 0.8,
                  transition: "opacity 0.15s",
                }}
              >
                See why sellers choose us ↓
              </a>
            </div>
          </AnimatedSection>
        </div>

        {/* Ticker */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
            padding: "14px 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="ticker-track">
            {TICKER_ITEMS.map((item, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                  fontSize: "15px",
                  letterSpacing: "0.14em",
                  color: i % 2 === 0 ? "#C8F542" : "rgba(232,228,220,0.35)",
                  paddingRight: 0,
                }}
              >
                {item}
                <DividerDot />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY NOTMADE ════ */}
      <section id="why" style={{ padding: "100px 0 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>

          {/* Section label */}
          <AnimatedSection>
            <div style={{ marginBottom: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#FF3B30",
                }}
              >
                THE PITCH
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: "60px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                  fontSize: "clamp(3rem, 7vw, 80px)",
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                  color: "#E8E4DC",
                  margin: 0,
                }}
              >
                WHY NOTMADE
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 15,
                  color: "rgba(232,228,220,0.45)",
                  maxWidth: 320,
                  lineHeight: 1.6,
                  margin: 0,
                  paddingBottom: 6,
                }}
              >
                Six reasons you should be selling with us and not anyone else.
              </p>
            </div>
          </AnimatedSection>

          {/* Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 2,
            }}
          >
            {REASONS.map((r, i) => (
              <AnimatedSection key={r.num} delay={i * 40}>
                <div
                  className="dark-card"
                  style={{
                    padding: "36px 32px",
                    height: "100%",
                    borderTop: `2px solid ${r.accent}`,
                    borderRadius: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: 13,
                      letterSpacing: "0.1em",
                      color: r.accent,
                      marginBottom: 20,
                    }}
                  >
                    {r.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: "clamp(1.4rem, 2.5vw, 28px)",
                      fontWeight: 400,
                      letterSpacing: "0.03em",
                      color: "#E8E4DC",
                      marginBottom: 14,
                      lineHeight: 1.05,
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-archivo), Archivo, sans-serif",
                      fontSize: 14,
                      color: "rgba(232,228,220,0.5)",
                      lineHeight: 1.7,
                    }}
                  >
                    {r.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "100px 0",
          background: "#111113",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>

          {/* Section label */}
          <AnimatedSection>
            <div style={{ marginBottom: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C8F542",
                }}
              >
                THE PROCESS
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(3rem, 7vw, 80px)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: "#E8E4DC",
                marginBottom: 64,
              }}
            >
              HOW IT WORKS
            </h2>
          </AnimatedSection>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2px",
            }}
          >
            {STEPS.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 80}>
                <div
                  style={{
                    padding: "40px 36px",
                    borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: "clamp(5rem, 10vw, 96px)",
                      fontWeight: 400,
                      lineHeight: 0.85,
                      letterSpacing: "0.01em",
                      color: "#C8F542",
                      marginBottom: 28,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: "clamp(1.5rem, 2.5vw, 28px)",
                      fontWeight: 400,
                      letterSpacing: "0.04em",
                      color: "#E8E4DC",
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-archivo), Archivo, sans-serif",
                      fontSize: 14,
                      color: "rgba(232,228,220,0.5)",
                      lineHeight: 1.7,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ APPLY FORM ════ */}
      <section id="apply" style={{ padding: "100px 0 120px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 28px" }}>

          <AnimatedSection>
            {/* Section label */}
            <div style={{ marginBottom: "1rem", textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#FF3B30",
                }}
              >
                LET'S TALK
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(3.5rem, 9vw, 96px)",
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: "0.02em",
                color: "#E8E4DC",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              READY TO SELL?
            </h2>
            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 16,
                color: "rgba(232,228,220,0.5)",
                textAlign: "center",
                lineHeight: 1.65,
                marginBottom: 48,
              }}
            >
              Fill this out. Our team will connect within 48 hours.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={60}>
            <div
              style={{
                background: "#111113",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "clamp(1.75rem, 5vw, 2.75rem)",
              }}
            >
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 28px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Top row: logo + legal links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <Logo />

            <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <a href="/privacy-policy" className="footer-pill">Privacy Policy</a>
              <a href="/terms" className="footer-pill">Terms &amp; Conditions</a>
              <a href="mailto:admin@notmade.in" className="footer-pill">Contact</a>
            </nav>
          </div>

          {/* Bottom row: copyright */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 12,
                color: "rgba(232,228,220,0.25)",
              }}
            >
              © 2026 House of Notmade Studio Pvt Ltd · Delhi NCR
            </p>
            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 12,
                color: "rgba(232,228,220,0.15)",
              }}
            >
              Pan India · GCC · Southeast Asia
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
