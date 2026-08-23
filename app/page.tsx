import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

/* ── Static data ── */

const WHY_ITEMS = [
  "17% flat commission — nothing else",
  "No monthly fees",
  "No hidden charges",
  "No ads required",
  "No initial deposit",
  "Pay only when you sell",
  "Sell across all NOTMADE platforms — website, app, voice",
  "3-hour delivery handled by us in Delhi NCR",
  "Video verified delivery — zero fraud",
  "Same day payouts after delivery",
];

const STEPS = [
  {
    num:   "01",
    title: "Apply",
    desc:  "Submit your brand details. Takes about 2 minutes.",
  },
  {
    num:   "02",
    title: "Get Approved",
    desc:  "We verify your products and brand identity. Hear back within 48 hours.",
  },
  {
    num:   "03",
    title: "List Products",
    desc:  "Upload your products via the seller portal. Each goes live after a quick review.",
  },
  {
    num:   "04",
    title: "Get Paid",
    desc:  "We handle delivery, returns, and same-day payouts. You focus on creating.",
  },
];

const TESTIMONIALS = [
  {
    initials: "TT",
    brand:    "THREAD THEORY",
    quote:
      "NOTMADE changed the game for us. We focus on making — they handle everything else.",
  },
  {
    initials: "KS",
    brand:    "KLASH STUDIOS",
    quote:
      "Same day payouts after delivery. No other marketplace even comes close to that.",
  },
  {
    initials: "UF",
    brand:    "URBAN FORM",
    quote:
      "17% flat commission, zero hidden fees. Exactly as advertised. Our margins finally make sense.",
  },
];

/* ── Sub-components ── */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span
      style={{
        fontSize: "1.25rem",
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <span style={{ color: light ? "#FFFFFF" : "#111111" }}>NOT</span>
      <span style={{ color: "#CC0000" }}>MADE</span>
    </span>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8.5l3 3 7-7"
        stroke="#CC0000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars() {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#CC0000">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Page ── */

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* ════ NAV ════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EEEEEE" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-[62px] flex items-center justify-between">
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a
              href="/login"
              className="text-[13px] font-semibold no-underline px-3.5 py-2 rounded-lg border border-[#DDDDDD] hover:bg-[#F5F5F5] hover:text-[#111111] transition-all"
              style={{ color: "#555555" }}
            >
              Login
            </a>
            <a
              href="#apply"
              className="btn-primary text-[13px] font-bold tracking-[0.04em] px-5 py-2.5"
              style={{ borderRadius: "8px" }}
            >
              Start Selling →
            </a>
          </div>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className="pt-[62px]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-36 text-center">
          <AnimatedSection>
            {/* Badge */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(204,0,0,0.06)",
                  color: "#CC0000",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  padding: "6px 18px",
                  borderRadius: "100px",
                  border: "1px solid rgba(204,0,0,0.15)",
                }}
              >
                Seller Programme — Now Open
              </span>
            </div>

            {/* Heading */}
            <h1 className="display-heading" style={{ marginBottom: "1.5rem" }}>
              Grow Your Brand on{" "}
              <span style={{ color: "#CC0000" }}>NOTMADE</span>
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: "#555555",
                lineHeight: 1.8,
                maxWidth: "520px",
                margin: "0 auto 2.5rem",
              }}
            >
              No hidden fees. No ads. No initial deposit.
              <br />
              Pay only when you sell.
            </p>

            {/* CTA */}
            <a
              href="#apply"
              className="btn-primary font-bold text-[15px] px-12 py-4"
              style={{ borderRadius: "12px" }}
            >
              Start Selling →
            </a>

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "16px 28px",
                marginTop: "2.75rem",
              }}
            >
              {[
                "17% flat commission",
                "No deposit needed",
                "48-hour approval",
                "Same day payouts",
              ].map(t => (
                <span
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#777777",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(204,0,0,0.08)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon size={10} />
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════ WHY NOTMADE ════ */}
      <section
        style={{ background: "#F7F7F7", borderTop: "1px solid #EEEEEE", borderBottom: "1px solid #EEEEEE" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-12 text-center">
            <h2 className="section-heading">Why NOTMADE?</h2>
            <p style={{ color: "#888888", fontSize: "15px", marginTop: "10px" }}>
              Built for sellers who are tired of the usual BS.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {WHY_ITEMS.map((item, i) => (
              <AnimatedSection key={i} delay={i * 40} className="h-full">
                <div className="card-3d h-full">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(204,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon size={16} />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#111111",
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section
        id="how"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EEEEEE" }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-14 text-center">
            <h2 className="section-heading">How it works</h2>
            <p style={{ color: "#888888", fontSize: "15px", marginTop: "10px" }}>
              Three steps from application to your first sale.
            </p>
          </AnimatedSection>

          {/* Stats row */}
          <AnimatedSection delay={30} className="mb-10">
            <div style={{ display: "flex", justifyContent: "center", gap: "0", flexWrap: "wrap" }}>
              {[
                { label: "17% flat commission", sub: "no other deductions" },
                { label: "0 hidden fees", sub: "no monthly charges" },
                { label: "7-day payouts", sub: "after delivery" },
              ].map(({ label, sub }, i) => (
                <div key={i} style={{
                  padding: "18px 32px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid #EEEEEE" : undefined,
                }}>
                  <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{label}</p>
                  <p style={{ fontSize: "12px", color: "#888888", marginTop: "4px" }}>{sub}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={60}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
              {STEPS.map(({ num, title, desc }) => (
                <div
                  key={num}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EEEEEE",
                    borderRadius: "20px",
                    padding: "32px 28px",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      fontWeight: 900,
                      color: "#CC0000",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      marginBottom: "18px",
                    }}
                  >
                    {num}
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#111111",
                      marginBottom: "10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#666666", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section
        style={{ background: "#F7F7F7", borderBottom: "1px solid #EEEEEE" }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-12 text-center">
            <h2 className="section-heading">What sellers say</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ initials, brand, quote }, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EEEEEE",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <Stars />
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.75,
                      color: "#333333",
                      marginTop: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(204,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#CC0000",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#111111",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {brand}
                      </p>
                      <p style={{ fontSize: "11px", color: "#888888" }}>
                        NOTMADE Seller
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════ APPLY FORM ════ */}
      <section
        id="apply"
        style={{ background: "#CC0000" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col items-center">
          <div style={{ width: "100%", maxWidth: "580px" }}>
            <AnimatedSection>
              {/* Above-card heading */}
              <div className="text-center mb-8">
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "-0.03em",
                    marginBottom: "10px",
                  }}
                >
                  Ready to sell?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
                  Apply in 2 minutes. We review within 48 hours.
                </p>
              </div>

              {/* Form card */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "clamp(1.75rem, 5vw, 2.5rem)",
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.14)",
                }}
              >
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3
                    style={{
                      fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                      fontWeight: 800,
                      color: "#111111",
                      marginBottom: "6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Seller Application
                  </h3>
                  <p style={{ fontSize: "14px", color: "#888888" }}>
                    Tell us about your brand and products.
                  </p>
                </div>
                <ApplyForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background: "#FFFFFF", borderTop: "1px solid #EEEEEE" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-8"
            style={{ borderBottom: "1px solid #EEEEEE" }}
          >
            <Logo />
            <p style={{ fontSize: "12px", color: "#888888" }}>
              ©2026 House of Notmade Studio Private Limited
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
            <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
            <a href="/terms"          className="footer-link">Terms</a>
            <a href="mailto:admin@notmade.in" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
