import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

/* ── Static data ── */

const COMMISSIONS = [
  { category: "Tees & Hoodies",      commission: "12%"   },
  { category: "Caps & Accessories",  commission: "13%"   },
  { category: "Sneakers & Footwear", commission: "14%"   },
  { category: "Jewellery & Others",  commission: "14.5%" },
];

const WHY = [
  {
    icon: "🚀",
    title: "India's fastest streetwear marketplace",
    desc:  "Delhi NCR gets 2-hour delivery. Pan India in 3–5 days. No other platform moves streetwear this fast.",
  },
  {
    icon: "📦",
    title: "We handle everything",
    desc:  "Marketing, delivery, returns, customer support, payments — all handled by our team. You just ship.",
  },
  {
    icon: "💰",
    title: "Simple, honest pricing",
    desc:  "Commission starts at 12%. No monthly fees. No hidden charges. You pay only when you sell.",
  },
];

const HANDLES = [
  { title: "Marketing & promotions",      desc: "We run campaigns that drive real buyers to your products."       },
  { title: "Fast nationwide delivery",    desc: "2-hour delivery in Delhi NCR. Pan India in 3–5 days."           },
  { title: "Customer support & queries",  desc: "Every query, complaint, and return — handled by our team."       },
  { title: "Payment collection",          desc: "We collect, verify, and settle payments on your behalf."         },
  { title: "Returns & exchanges",         desc: "Full returns management. We handle the entire process."          },
  { title: "Platform & technology",       desc: "Your storefront, listings, and pages — fully managed."           },
];

const STEPS = [
  {
    num:   "01",
    title: "Apply",
    desc:  "Fill the form below. Takes about 2 minutes.",
  },
  {
    num:   "02",
    title: "Review",
    desc:  "Our team reviews every application within 2–3 working days. You'll get an email either way.",
  },
  {
    num:   "03",
    title: "Onboard",
    desc:  "Share basic KYC and product details. We set up your listings.",
  },
  {
    num:   "04",
    title: "Go Live",
    desc:  "Your products go live on NOTMADE within 2 hours of approval.",
  },
];

const WHO = [
  {
    title: "Independent Labels",
    desc:  "You've built something real. We help you reach the right buyers, faster.",
  },
  {
    title: "Small Batch Makers",
    desc:  "50 pieces or 500. We work with what you make. Minimum 5 products to list.",
  },
  {
    title: "Pan India Sellers",
    desc:  "List from anywhere in India. We reach buyers nationwide — not just one city.",
  },
];

const FAQS = [
  {
    q: "What does the commission include?",
    a: "Just the percentage on sales — 12% to 14.5% depending on category. No setup fee, no monthly fee, no listing fee.",
  },
  {
    q: "How long does the review take?",
    a: "2–3 working days. You'll get an email with our decision either way.",
  },
  {
    q: "What if my application isn't accepted?",
    a: "We'll let you know why. You can reapply after 3 months as we expand our catalogue.",
  },
  {
    q: "How do payouts work?",
    a: "Monthly. Sales minus commission, transferred to your bank account by the 7th of the following month.",
  },
  {
    q: "Do I need GST?",
    a: "Not mandatory for smaller sellers. Helpful for higher volumes and proper B2B invoicing.",
  },
  {
    q: "Can I list from anywhere in India?",
    a: "Yes. All Pan India sellers are welcome. Delhi NCR sellers get the 2-hour delivery advantage for local customers.",
  },
  {
    q: "What happens after approval?",
    a: "We ask for basic KYC (Aadhaar/PAN) and your product details. Once verified, you're live within 2 hours.",
  },
];

/* ── Logo ── */
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
      <span style={{ color: light ? "#FFFFFF" : "#0A0A0A" }}>NOT</span>
      <span style={{ color: "#C41E2E" }}>MADE</span>
    </span>
  );
}

/* ── Page ── */

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ════════ NAV ════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: "1px solid #E5E5E5" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-[58px] flex items-center justify-between">
          <Logo />
          <a
            href="#apply"
            className="btn-primary text-[13px] font-semibold tracking-[0.03em] px-5 py-2.5"
            style={{ borderRadius: "6px" }}
          >
            Apply Now
          </a>
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="pt-[58px]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-20 items-center">

          {/* Left — copy */}
          <div style={{ maxWidth: "680px" }}>

            {/* Label */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  color: "#C41E2E",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Seller Programme — Now Open
              </span>
            </div>

            <h1
              className="display-heading"
              style={{ marginBottom: "1.5rem" }}
            >
              Your brand.<br />Bigger reach.
            </h1>

            <p
              style={{
                color: "#6B7280",
                fontSize: "18px",
                lineHeight: 1.7,
                marginBottom: "2.5rem",
                maxWidth: "520px",
              }}
            >
              We&apos;re building India&apos;s fastest streetwear marketplace.
              Independent labels list with us — we handle marketing,
              delivery, and customer support. You focus on the product.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a
                href="#apply"
                className="btn-primary font-semibold text-[14px] px-8 py-3.5"
                style={{ borderRadius: "6px" }}
              >
                Apply to Sell →
              </a>
              <a
                href="#how"
                style={{
                  color: "#0A0A0A",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  alignSelf: "center",
                }}
              >
                See how it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Reviewed in 2–3 days",
                "No setup fee",
                "Go live in 2 hours",
              ].map((t) => (
                <span
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#9CA3AF",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 7l3 3L11 3"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — portal mockup (no fake data) */}
          <div className="hidden lg:block">
            <div
              style={{
                background: "#111111",
                borderRadius: "10px",
                padding: "28px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  borderBottom: "1px solid #1E1E1E",
                  paddingBottom: "14px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#444",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 600,
                  }}
                >
                  NOTMADE SELLER PORTAL
                </span>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#C41E2E",
                    display: "inline-block",
                  }}
                />
              </div>

              {/* 3 metric skeleton cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "#1A1A1A",
                      borderRadius: "5px",
                      padding: "14px 12px",
                    }}
                  >
                    <div
                      style={{
                        width: "55%",
                        height: "4px",
                        background: "#2A2A2A",
                        borderRadius: "2px",
                        marginBottom: "10px",
                      }}
                    />
                    <div
                      style={{
                        width: i === 2 ? "40%" : "65%",
                        height: "18px",
                        background: "#222",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Bar chart skeleton */}
              <div
                style={{
                  background: "#1A1A1A",
                  borderRadius: "5px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    width: "32%",
                    height: "4px",
                    background: "#2A2A2A",
                    borderRadius: "2px",
                    marginBottom: "14px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "5px",
                    height: "56px",
                  }}
                >
                  {[30, 55, 38, 72, 48, 90, 42, 65].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        background: i === 5 ? "#C41E2E" : "#252525",
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════ WHY NOTMADE ════════ */}
      <section style={{ background: "#F5F5F5", borderTop: "1px solid #E5E5E5" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="section-heading">Why sell on NOTMADE?</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {WHY.map(({ icon, title, desc }, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div style={{ fontSize: "2rem", marginBottom: "16px", lineHeight: 1 }}>
                  {icon}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0A0A0A",
                    marginBottom: "8px",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#6B7280" }}>
                  {desc}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ COMMISSION TABLE ════════ */}
      <section id="commission" className="bg-white" style={{ borderTop: "1px solid #E5E5E5" }}>
        <div className="max-w-xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection>
            <h2 className="section-heading mb-3">Transparent pricing.</h2>
            <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "2rem" }}>
              Commission varies by category. Nothing else is charged.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid #0A0A0A" }}>
                  <th
                    className="text-left pb-3 text-[13px] font-semibold"
                    style={{ color: "#0A0A0A" }}
                  >
                    Category
                  </th>
                  <th
                    className="text-right pb-3 text-[13px] font-semibold"
                    style={{ color: "#0A0A0A" }}
                  >
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS.map(({ category, commission }, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #E5E5E5",
                      background: i % 2 === 1 ? "#F9F9F9" : "transparent",
                    }}
                  >
                    <td
                      className="py-[14px] text-[15px]"
                      style={{ color: "#333" }}
                    >
                      {category}
                    </td>
                    <td
                      className="py-[14px] text-[15px] font-bold text-right tabular-nums"
                      style={{ color: "#C41E2E" }}
                    >
                      {commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: "20px", fontSize: "13px", color: "#9CA3AF" }}>
              We charge commission only on successful sales.
              Zero deductions for unsold inventory.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ WHAT WE HANDLE ════════ */}
      <section style={{ background: "#F5F5F5", borderTop: "1px solid #E5E5E5" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="section-heading">You make it. We handle the rest.</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 md:gap-10">
            {HANDLES.map(({ title, desc }, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: "1px" }}
                  >
                    <circle cx="10" cy="10" r="10" fill="#C41E2E" fillOpacity="0.1" />
                    <path
                      d="M6 10.5l2.5 2.5L14 7"
                      stroke="#C41E2E"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0A0A0A",
                        marginBottom: "4px",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.65 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how" className="bg-white" style={{ borderTop: "1px solid #E5E5E5" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-14">
            <h2 className="section-heading">Four steps to going live.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            {/* Desktop: horizontal with connecting line */}
            <div className="hidden lg:block">
              {/* Numbers row with underline acting as connector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 0,
                  paddingBottom: "18px",
                  borderBottom: "1px solid #E5E5E5",
                  marginBottom: "22px",
                }}
              >
                {STEPS.map(({ num }) => (
                  <div key={num} style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: "2.75rem",
                        fontWeight: 800,
                        color: "#C41E2E",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {num}
                    </span>
                  </div>
                ))}
              </div>
              {/* Content row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "32px",
                }}
              >
                {STEPS.map(({ num, title, desc }) => (
                  <div key={num}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#0A0A0A",
                        marginBottom: "8px",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.65 }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: vertical with left border */}
            <div
              className="lg:hidden"
              style={{
                borderLeft: "1px solid #E5E5E5",
                paddingLeft: "24px",
                marginLeft: "14px",
              }}
            >
              {STEPS.map(({ num, title, desc }, i) => (
                <div
                  key={num}
                  style={{
                    position: "relative",
                    paddingBottom: i < STEPS.length - 1 ? "32px" : 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "-33px",
                      top: "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#C41E2E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      fontWeight: 800,
                      color: "#FFF",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#C41E2E",
                      lineHeight: 1,
                      marginBottom: "6px",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {num}
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0A0A0A",
                      marginBottom: "6px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ WHO WE WORK WITH ════════ */}
      <section style={{ background: "#0A0A0A", borderTop: "1px solid #111" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-12">
            <h2 className="section-heading" style={{ color: "#FFFFFF" }}>
              Built for independent brands.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHO.map(({ title, desc }, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <div className="who-card">
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      marginBottom: "10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ APPLICATION FORM ════════ */}
      <section
        id="apply"
        style={{ background: "#C41E2E", borderTop: "1px solid #A01828" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24 flex flex-col items-center">
          <div style={{ width: "100%", maxWidth: "560px" }}>
            <AnimatedSection>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "clamp(1.75rem,5vw,2.5rem)",
                }}
              >
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2
                    style={{
                      fontSize: "clamp(1.4rem,3vw,1.75rem)",
                      fontWeight: 800,
                      color: "#0A0A0A",
                      marginBottom: "6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Apply to sell on NOTMADE
                  </h2>
                  <p style={{ fontSize: "14px", color: "#6B7280" }}>
                    2 minutes to apply. We review within 2–3 working days.
                  </p>
                </div>
                <ApplyForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="bg-white" style={{ borderTop: "1px solid #E5E5E5" }}>
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-20 md:py-24">
          <AnimatedSection className="mb-10">
            <h2 className="section-heading">Questions we get asked.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div style={{ borderTop: "1px solid #E5E5E5" }}>
              {FAQS.map(({ q, a }, i) => (
                <details key={i} className="faq-item">
                  <summary className="flex items-start justify-between py-5 gap-6 cursor-pointer select-none">
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#0A0A0A",
                        lineHeight: "1.4",
                      }}
                    >
                      {q}
                    </span>
                    <span
                      className="faq-chevron flex-shrink-0"
                      style={{ color: "#C41E2E" }}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    style={{
                      paddingBottom: "20px",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      color: "#6B7280",
                    }}
                  >
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background: "#0A0A0A", borderTop: "1px solid #111" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div style={{ marginBottom: "6px" }}>
                <Logo light />
              </div>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Delhi&apos;s streetwear marketplace.
              </p>
            </div>
            <p style={{ fontSize: "13px" }}>
              <a
                href="mailto:admin@notmade.in"
                className="transition-colors hover:text-white"
                style={{ color: "#888" }}
              >
                admin@notmade.in
              </a>
              {" · "}
              <a
                href="tel:+919354852701"
                className="transition-colors hover:text-white"
                style={{ color: "#888" }}
              >
                +91 93548 52701
              </a>
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid #1A1A1A" }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              © 2026 NOTMADE. ALL RIGHTS RESERVED.
            </p>
            <div
              style={{
                display: "flex",
                gap: "20px",
                fontSize: "11px",
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <a href="/privacy-policy" className="transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms" className="transition-colors hover:text-white">
                Terms
              </a>
              <a href="/refund-policy" className="transition-colors hover:text-white">
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
