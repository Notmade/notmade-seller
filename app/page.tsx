import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

/* ── Static data ── */

const REASONS = [
  {
    num: "01",
    title: "BETTER COMMISSION, ALWAYS",
    desc: "We built this from scratch — no legacy tech, no VC pressure, no middlemen taking a cut. Every percentage point we don't spend on overhead goes back to you as better margins. That's not a pitch, that's the structure.",
    stat: "17% flat. Industry average sits at 25–40%.",
  },
  {
    num: "02",
    title: "7-DAY PAYOUTS. NO DRAMA.",
    desc: "Cash flow is what kills independent brands, not competition. We pay within 7 days of delivery confirmation — every time, no manual requests, no chasing anyone down. You made the product. You should have the money.",
    stat: "7 days. Not monthly. Not after dispute resolution.",
  },
  {
    num: "03",
    title: "VIDEO VERIFIED DELIVERY",
    desc: "Every order we dispatch is video-recorded during packing and at the point of delivery. If a customer claims non-receipt or damage, there's footage. Zero fraud on your end, zero disputes you can't win. This is the standard, not an add-on.",
    stat: "Every delivery documented. No he-said-she-said.",
  },
  {
    num: "04",
    title: "YOUR CUSTOMERS, YOUR DATA",
    desc: "On most platforms, your buyers are their buyers. Not here. You get access to your complete buyer database — names, orders, preferences — at nominal cost. Use it for re-marketing, CRM, product research, or building direct relationships.",
    stat: "Full buyer database access. Your data, your call.",
  },
  {
    num: "05",
    title: "VISIBILITY THAT CONVERTS",
    desc: "We curate, we don't just list. Your product isn't buried under 50,000 SKUs competing on price. We place you in front of buyers who are already looking for what you make — people who understand craft, quality, and independent brands.",
    stat: "Curated placement. Not a race to the bottom.",
  },
  {
    num: "06",
    title: "GOING INTERNATIONAL",
    desc: "We're building the infrastructure to take Indian independent brands to GCC and Southeast Asia — two markets that are hungry for premium, authentic product. When we get there, your brand comes with us. Not as an afterthought. As a priority.",
    stat: "GCC & Southeast Asia. Already in the pipeline.",
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
  "VIDEO VERIFIED DELIVERY",
  "CURATED PLACEMENT",
  "YOUR CUSTOMER DATA",
  "GOING INTERNATIONAL",
  "PAN INDIA COVERAGE",
  "7-DAY PAYOUTS",
  "BETTER MARGINS",
  "VIDEO VERIFIED DELIVERY",
  "CURATED PLACEMENT",
  "YOUR CUSTOMER DATA",
  "GOING INTERNATIONAL",
  "PAN INDIA COVERAGE",
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

          {/* Section header */}
          <AnimatedSection>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 32,
                flexWrap: "wrap",
                marginBottom: 64,
                paddingBottom: 40,
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-archivo), Archivo, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#FF3B30",
                    marginBottom: 14,
                  }}
                >
                  THE PITCH
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                    fontSize: "clamp(3.5rem, 7.5vw, 88px)",
                    fontWeight: 400,
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                    color: "#E8E4DC",
                    margin: 0,
                  }}
                >
                  WHY<br />
                  <span style={{ color: "#FF3B30" }}>NOT</span>MADE
                </h2>
              </div>
              <div style={{ maxWidth: 380, paddingTop: 8 }}>
                <p
                  style={{
                    fontFamily: "var(--font-archivo), Archivo, sans-serif",
                    fontSize: 16,
                    color: "rgba(232,228,220,0.55)",
                    lineHeight: 1.75,
                    marginBottom: 20,
                  }}
                >
                  Six honest reasons you should be selling with us and not
                  anywhere else. No stock photography, no vague promises.
                </p>
                <a
                  href="#apply"
                  style={{
                    fontFamily: "var(--font-archivo), Archivo, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#C8F542",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Apply to sell →
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {REASONS.map((r, i) => (
              <AnimatedSection key={r.num} delay={i * 50}>
                <div
                  style={{
                    background: "#111113",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "36px 32px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  className="dark-card"
                >
                  {/* Number */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                        fontSize: 12,
                        letterSpacing: "0.14em",
                        color: "#FF3B30",
                        background: "rgba(255,59,48,0.1)",
                        border: "1px solid rgba(255,59,48,0.2)",
                        borderRadius: 4,
                        padding: "3px 10px",
                      }}
                    >
                      {r.num}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: "clamp(1.5rem, 2.8vw, 30px)",
                      fontWeight: 400,
                      letterSpacing: "0.03em",
                      color: "#E8E4DC",
                      marginBottom: 16,
                      lineHeight: 1.05,
                    }}
                  >
                    {r.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "var(--font-archivo), Archivo, sans-serif",
                      fontSize: 14,
                      color: "rgba(232,228,220,0.52)",
                      lineHeight: 1.78,
                      flex: 1,
                      marginBottom: 28,
                    }}
                  >
                    {r.desc}
                  </p>

                  {/* Stat callout */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: 20,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        background: "#C8F542",
                        borderRadius: 2,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-archivo), Archivo, sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#C8F542",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {r.stat}
                    </p>
                  </div>
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
