import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

const COMMISSIONS = [
  { category: "Tees & Hoodies",     commission: "12%"   },
  { category: "Caps & Accessories", commission: "13%"   },
  { category: "Sneakers & Footwear",commission: "14%"   },
  { category: "Jewellery & Others", commission: "14.5%" },
];

const THE_NUMBERS = [
  { value: "12–14%",  label: "Commission per sale", sub: "Varies by category"           },
  { value: "₹0",      label: "Setup fee",            sub: "No monthly charges"           },
  { value: "2 hrs",   label: "Time to go live",      sub: "After onboarding"             },
  { value: "Monthly", label: "Payout cycle",         sub: "Transferred by 7th of month"  },
];

const HANDLES_LEFT  = ["Marketing & promotions", "Customer support",    "Delivery & logistics" ];
const HANDLES_RIGHT = ["Payment collection",      "Returns management",  "Platform & technology"];

const HOW_IT_WORKS = [
  { num: "01", title: "Apply",   desc: "Fill the form below. Takes 2 minutes."               },
  { num: "02", title: "Review",  desc: "We review applications in 2–3 working days."         },
  { num: "03", title: "Onboard", desc: "Share KYC documents and product details."            },
  { num: "04", title: "Go Live", desc: "Your products are live within 2 hours of approval."  },
];

const REQUIREMENTS = [
  "Original/authentic products only",
  "Minimum 5 products to list",
  "Quality photos (we can help if needed)",
  "Ability to dispatch within 48 hours of order",
  "Valid business identity (GST optional for small sellers)",
];

const FAQS = [
  {
    q: "What commission do you charge?",
    a: "Between 12–14.5% depending on product category. Nothing else — no setup fee, no monthly fee, no hidden charges.",
  },
  {
    q: "How long does the review take?",
    a: "We review all applications within 2–3 working days and send an email with our decision.",
  },
  {
    q: "What if my application is rejected?",
    a: "We'll let you know why, and you're welcome to reapply after 3 months as our catalogue grows.",
  },
  {
    q: "How do payouts work?",
    a: "Monthly. We calculate your earnings (sales minus commission) and transfer to your bank account by the 7th of each month.",
  },
  {
    q: "Do I need a GST number?",
    a: "Not mandatory for small sellers. But having one helps with larger order volumes and invoicing.",
  },
  {
    q: "Can I list products from outside Delhi NCR?",
    a: "Yes. Delhi NCR sellers get same-day delivery advantage, but pan-India sellers are welcome.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white"
        style={{ borderBottom: "1px solid #E5E5E5" }}
      >
        <span className="font-bebas text-2xl tracking-widest">
          <span style={{ color: "#111111" }}>NOT</span>
          <span style={{ color: "#C41E2E" }}>MADE</span>
        </span>
        <a
          href="#apply"
          className="btn-red text-xs font-semibold tracking-widest uppercase px-5 py-2.5"
        >
          Apply Now
        </a>
      </nav>

      {/* ══════════════════════════════════════
          1 — HERO
      ══════════════════════════════════════ */}
      <section className="px-6 md:px-12 pt-32 pb-24" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <span className="seller-tag">Seller Programme</span>

            <h1 className="hero-heading mt-5 mb-6">
              Your brand deserves<br />better distribution.
            </h1>

            <p
              className="text-base leading-[1.8] mb-10"
              style={{ color: "#666666", maxWidth: "460px" }}
            >
              NOTMADE gives independent labels direct access to Delhi NCR&apos;s
              streetwear buyers. Same-day delivery, zero setup cost, real customers.
            </p>

            <div className="flex items-center gap-8 mb-10">
              <div>
                <div className="text-3xl font-bold leading-none" style={{ color: "#C41E2E" }}>12%</div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] mt-1"
                  style={{ color: "#999999", fontFamily: "var(--font-space-mono)" }}
                >
                  Commission
                </div>
              </div>
              <div style={{ width: "1px", height: "40px", background: "#E5E5E5" }} />
              <div>
                <div className="text-3xl font-bold leading-none" style={{ color: "#C41E2E" }}>₹0</div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] mt-1"
                  style={{ color: "#999999", fontFamily: "var(--font-space-mono)" }}
                >
                  Setup fee
                </div>
              </div>
            </div>

            <a
              href="#apply"
              className="btn-red inline-block font-semibold text-sm tracking-widest uppercase px-10 py-4"
            >
              Apply Now →
            </a>
          </div>

          {/* Geometric shape */}
          <div className="relative hidden lg:flex items-center justify-end">
            <div className="relative" style={{ width: "360px", height: "380px" }}>
              <div
                style={{
                  position: "absolute",
                  top: "15%",
                  left: "20%",
                  right: 0,
                  bottom: 0,
                  background: "#C41E2E",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "200px",
                  height: "200px",
                  border: "1.5px solid #E5E5E5",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "8%",
                  left: "12%",
                  width: "22px",
                  height: "22px",
                  background: "#C41E2E",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2 — THE NUMBERS (grey)
      ══════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20" style={{ background: "#F8F8F8" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">By the numbers</span>
            <h2 className="section-heading">The numbers that matter.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ background: "#E5E5E5" }}
            >
              {THE_NUMBERS.map(({ value, label, sub }) => (
                <div
                  key={label}
                  className="px-8 py-10"
                  style={{ background: "#F8F8F8", borderTop: "3px solid #C41E2E" }}
                >
                  <div
                    className="font-bold leading-none mb-2"
                    style={{
                      fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                      color: "#111111",
                    }}
                  >
                    {value}
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#111111" }}>
                    {label}
                  </div>
                  <div className="text-xs" style={{ color: "#999999" }}>{sub}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3 — COMMISSION BREAKDOWN (white)
      ══════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20" style={{ background: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">Pricing</span>
            <h2 className="section-heading">Simple, transparent pricing.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid #111111" }}>
                  <th
                    className="text-left pb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "#111111", fontFamily: "var(--font-space-mono)" }}
                  >
                    Category
                  </th>
                  <th
                    className="text-right pb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "#111111", fontFamily: "var(--font-space-mono)" }}
                  >
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMMISSIONS.map(({ category, commission }, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td className="py-4 text-sm" style={{ color: "#444444" }}>{category}</td>
                    <td
                      className="py-4 text-sm font-bold text-right"
                      style={{ color: "#C41E2E" }}
                    >
                      {commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-sm leading-relaxed" style={{ color: "#888888" }}>
              No hidden fees. No monthly charges. You only pay when you sell.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4 — WHAT WE HANDLE (white, rule-top)
      ══════════════════════════════════════ */}
      <section
        className="px-6 md:px-12 py-20"
        style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">What&apos;s included</span>
            <h2 className="section-heading">You make it. We handle everything else.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-3">
                {HANDLES_LEFT.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 py-3.5 px-5"
                    style={{ background: "#F8F8F8" }}
                  >
                    <span className="flex-shrink-0 font-bold text-sm" style={{ color: "#C41E2E" }}>✓</span>
                    <span className="text-sm" style={{ color: "#333333" }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {HANDLES_RIGHT.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 py-3.5 px-5"
                    style={{ background: "#F8F8F8" }}
                  >
                    <span className="flex-shrink-0 font-bold text-sm" style={{ color: "#C41E2E" }}>✓</span>
                    <span className="text-sm" style={{ color: "#333333" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5 — HOW IT WORKS (grey)
      ══════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 py-20"
        style={{ background: "#F8F8F8" }}
      >
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">The process</span>
            <h2 className="section-heading">Four steps to go live.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ background: "#E5E5E5" }}
            >
              {HOW_IT_WORKS.map(({ num, title, desc }) => (
                <div key={num} className="p-8" style={{ background: "#F8F8F8" }}>
                  <div
                    className="font-bebas text-5xl leading-none mb-4"
                    style={{ color: "rgba(196,30,46,0.18)" }}
                  >
                    {num}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#111111" }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6 — REQUIREMENTS (white)
      ══════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20" style={{ background: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">Who can apply</span>
            <h2 className="section-heading">What we look for in sellers.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <ul className="space-y-0">
              {REQUIREMENTS.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 py-4"
                  style={{ borderBottom: "1px solid #F0F0F0" }}
                >
                  <span
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]"
                    style={{ background: "#C41E2E" }}
                  />
                  <span className="text-sm leading-relaxed" style={{ color: "#444444" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm italic" style={{ color: "#888888" }}>
              We work with small batch makers, independent labels, and growing brands.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7 — APPLICATION FORM (red)
      ══════════════════════════════════════ */}
      <section id="apply" className="px-6 md:px-12 py-24" style={{ background: "#C41E2E" }}>
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="mb-8">
            <h2
              className="font-bold leading-tight mb-2"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", color: "#FFFFFF" }}
            >
              Apply in 2 minutes.
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              We read every application ourselves. You&apos;ll hear back within 2–3 working days.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div style={{ background: "#FFFFFF", padding: "clamp(1.75rem, 5vw, 2.5rem)" }}>
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8 — FAQ (white)
      ══════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20" style={{ background: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">FAQ</span>
            <h2 className="section-heading">Common questions.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div style={{ borderTop: "1px solid #E5E5E5" }}>
              {FAQS.map(({ q, a }, i) => (
                <details key={i} className="faq-item">
                  <summary className="flex items-start justify-between py-5 gap-6 cursor-pointer select-none">
                    <span
                      className="text-sm font-semibold leading-snug"
                      style={{ color: "#111111" }}
                    >
                      {q}
                    </span>
                    <span className="faq-chevron flex-shrink-0" style={{ color: "#C41E2E" }}>
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed" style={{ color: "#666666" }}>
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER (dark)
      ══════════════════════════════════════ */}
      <footer className="px-6 md:px-12 py-16" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <span className="font-bebas text-3xl tracking-widest" style={{ color: "#FFFFFF" }}>
              NOTMADE
            </span>
            <p className="text-sm" style={{ color: "#888888" }}>
              For seller queries:{" "}
              <a
                href="mailto:admin@notmade.in"
                className="transition-colors hover:text-white"
                style={{ color: "#AAAAAA" }}
              >
                admin@notmade.in
              </a>
              {" | "}
              <a
                href="tel:+919354852701"
                className="transition-colors hover:text-white"
                style={{ color: "#AAAAAA" }}
              >
                +91 93548 52701
              </a>
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid #222222" }}
          >
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#555555", fontFamily: "var(--font-space-mono)" }}
            >
              © 2026 NOTMADE. ALL RIGHTS RESERVED.
            </p>
            <div
              className="flex gap-6 text-[10px] uppercase tracking-widest"
              style={{ color: "#555555", fontFamily: "var(--font-space-mono)" }}
            >
              <a href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</a>
              <a href="/terms"          className="transition-colors hover:text-white">Terms</a>
              <a href="/refund-policy"  className="transition-colors hover:text-white">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
