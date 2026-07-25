import AnimatedSection from "./components/AnimatedSection";
import ApplyForm from "./components/ApplyForm";

/* ── Static data ── */

const COMMISSIONS = [
  { category: "Tees & Hoodies",      commission: "12%"   },
  { category: "Caps & Accessories",  commission: "13%"   },
  { category: "Sneakers & Footwear", commission: "14%"   },
  { category: "Jewellery & Others",  commission: "14.5%" },
];

const HANDLES = [
  { title: "Marketing & ads",      desc: "We run campaigns that drive real buyers to your products."        },
  { title: "Payment collection",   desc: "We collect, verify, and settle payments on your behalf."         },
  { title: "Customer support",     desc: "Every query, complaint, and return — handled by our team."       },
  { title: "Platform & tech",      desc: "Your storefront, listings, and pages — fully managed."           },
  { title: "Delivery & returns",   desc: "2-hour delivery in Delhi NCR. Same-day or next-day elsewhere."   },
  { title: "Performance reports",  desc: "Monthly breakdowns of sales, returns, and payout summaries."     },
];

const STEPS = [
  { num: "01", title: "Apply",   desc: "Fill the form below. Takes 2 minutes."               },
  { num: "02", title: "Review",  desc: "We review all applications in 2–3 working days."     },
  { num: "03", title: "Onboard", desc: "Share KYC documents and your product details."       },
  { num: "04", title: "Go Live", desc: "Products are live within 2 hours of approval."       },
];

const WHO = [
  {
    title: "Independent Labels",
    desc:  "You've built something. We help you scale it across Delhi NCR and beyond.",
  },
  {
    title: "Small Batch Makers",
    desc:  "50 pieces or 500. We work with what you make — no volume minimums.",
  },
  {
    title: "Delhi NCR Brands",
    desc:  "Your customers get 2-hour delivery. No other platform offers this.",
  },
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

const MOCK_ORDERS = [
  { name: "Heavyweight Tee — Black",   price: "₹1,299", ago: "2m"  },
  { name: "5-Panel Cap — Olive",       price: "₹899",   ago: "18m" },
  { name: "Oversized Hoodie — Ash",    price: "₹2,199", ago: "1h"  },
];

/* ── Page ── */

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: "1px solid #EBEBEB" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-[58px] flex items-center justify-between">
          <span className="font-bebas text-[1.5rem] tracking-widest leading-none">
            <span style={{ color: "#111111" }}>NOT</span>
            <span style={{ color: "#C41E2E" }}>MADE</span>
          </span>
          <a
            href="#apply"
            className="btn-primary text-[11px] font-semibold tracking-[0.08em] uppercase px-5 py-2"
          >
            Apply to Sell
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="pt-[58px]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-16 lg:gap-20 items-center">

          {/* Left — copy */}
          <div>
            {/* Status tag */}
            <div className="inline-flex items-center gap-2 mb-8">
              <span
                className="inline-block w-[7px] h-[7px] rounded-full"
                style={{ background: "#22C55E" }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#666666", fontFamily: "var(--font-space-mono)" }}
              >
                Seller Programme · Open
              </span>
            </div>

            <h1 className="display-heading mb-6 text-balance">
              Reach Delhi&apos;s streetwear buyers. Fast.
            </h1>

            <p
              className="text-[17px] leading-[1.78] mb-10"
              style={{ color: "#555555", maxWidth: "455px" }}
            >
              List your brand on NOTMADE. We handle marketing, delivery,
              payments, and customer support. You focus on making great products.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-9">
              <a
                href="#apply"
                className="btn-primary font-semibold text-[13px] tracking-[0.05em] uppercase px-8 py-[13px]"
              >
                Apply to Sell
              </a>
              <a
                href="#commission"
                className="flex items-center self-center text-[14px] font-medium transition-colors"
                style={{ color: "#888888" }}
              >
                Learn more ↓
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["Reviewed within 2–3 days", "No setup fee", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[13px]" style={{ color: "#AAAAAA" }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6.5l2.5 2.5L10 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — seller dashboard mockup */}
          <div className="hidden lg:block relative">
            {/* Floating label */}
            <div
              className="absolute -top-3.5 right-6 z-10"
              style={{
                background: "#111111",
                color: "#FFFFFF",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              ₹0 setup fee
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E4",
                boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Window chrome */}
              <div
                style={{
                  background: "#FAFAFA",
                  borderBottom: "1px solid #EBEBEB",
                  padding: "11px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
                  DEADSTOCK CO.
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                  <span style={{ fontSize: "11px", color: "#22C55E", fontWeight: 500 }}>Live</span>
                </span>
              </div>

              {/* Stats */}
              <div style={{ padding: "18px 18px 0" }}>
                <div
                  style={{
                    fontSize: "10px", color: "#BBBBBB", textTransform: "uppercase",
                    letterSpacing: "0.12em", marginBottom: "12px",
                    fontFamily: "var(--font-space-mono)",
                  }}
                >
                  November 2025
                </div>
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
                    paddingBottom: "16px", borderBottom: "1px solid #F0F0F0", marginBottom: "14px",
                  }}
                >
                  {[
                    { val: "47",     label: "Orders",     red: false },
                    { val: "₹89.4K", label: "Revenue",    red: false },
                    { val: "12%",    label: "Commission",  red: true  },
                  ].map(({ val, label, red }) => (
                    <div key={label}>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: red ? "#C41E2E" : "#111", lineHeight: 1 }}>
                        {val}
                      </div>
                      <div style={{ fontSize: "11px", color: "#999", marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order list */}
              <div style={{ padding: "0 18px 6px" }}>
                <div
                  style={{
                    fontSize: "10px", color: "#BBBBBB", textTransform: "uppercase",
                    letterSpacing: "0.12em", marginBottom: "8px",
                    fontFamily: "var(--font-space-mono)",
                  }}
                >
                  Recent orders
                </div>
                {MOCK_ORDERS.map((order, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingTop: 9, paddingBottom: 9,
                      borderTop: i > 0 ? "1px solid #F5F5F5" : undefined,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>{order.name}</div>
                      <div style={{ fontSize: "11px", color: "#999" }}>{order.price}</div>
                    </div>
                    <span style={{ fontSize: "11px", color: "#C8C8C8" }}>{order.ago} ago</span>
                  </div>
                ))}
              </div>

              {/* Payout row */}
              <div
                style={{
                  margin: "10px 18px 18px",
                  padding: "11px 15px",
                  background: "#F8F8F8",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#777" }}>Next payout</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>₹78,672 · Dec 7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: "1px solid #F0F0F0" }} />

      {/* ════════════════════════════════════
          COMMISSION
      ════════════════════════════════════ */}
      <section id="commission" className="py-24" style={{ background: "#F5F5F5" }}>
        <div className="max-w-xl mx-auto px-6 md:px-10">
          <AnimatedSection>
            <span className="eyebrow">Pricing</span>
            <h2 className="section-heading mb-3">
              Straightforward pricing. Nothing hidden.
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "#666666" }}>
              We charge a commission on each completed sale. That&apos;s it.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div style={{ marginTop: "2rem" }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid #D0D0D0" }}>
                    <th
                      className="text-left pb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: "#999999", fontFamily: "var(--font-space-mono)" }}
                    >
                      Category
                    </th>
                    <th
                      className="text-right pb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: "#999999", fontFamily: "var(--font-space-mono)" }}
                    >
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSIONS.map(({ category, commission }, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #E8E8E8" }}>
                      <td className="py-[14px] text-[15px]" style={{ color: "#333333" }}>
                        {category}
                      </td>
                      <td
                        className="py-[14px] text-[15px] font-semibold text-right tabular-nums"
                        style={{ color: "#C41E2E" }}
                      >
                        {commission}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-[13px]" style={{ color: "#999999" }}>
                No monthly fees. No setup costs. No surprise charges.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHAT WE HANDLE
      ════════════════════════════════════ */}
      <section className="py-24 bg-white" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">What&apos;s included</span>
            <h2 className="section-heading">You make it. We sell it.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "#EBEBEB" }}>
              {HANDLES.map(({ title, desc }) => (
                <div key={title} className="bg-white px-8 py-7">
                  <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: "#111111" }}>
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#777777" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <section className="py-24" style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">The process</span>
            <h2 className="section-heading">Four steps to go live.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ background: "#DEDEDE" }}
            >
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="px-8 py-10" style={{ background: "#F5F5F5" }}>
                  <div
                    className="font-bebas leading-none mb-6 select-none"
                    style={{ fontSize: "3.75rem", color: "#E0E0E0", letterSpacing: "-0.03em" }}
                  >
                    {num}
                  </div>
                  <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#111111" }}>
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#777777" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHO WE WORK WITH
      ════════════════════════════════════ */}
      <section className="py-24 bg-white" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">Who can apply</span>
            <h2 className="section-heading">Built for independent brands.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {WHO.map(({ title, desc }) => (
                <div
                  key={title}
                  className="px-7 py-8"
                  style={{ border: "1px solid #EBEBEB" }}
                >
                  <h3 className="text-[15px] font-semibold mb-3" style={{ color: "#111111" }}>
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#777777" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          APPLICATION FORM
      ════════════════════════════════════ */}
      <section
        id="apply"
        className="py-24"
        style={{ background: "#F5F5F5", borderTop: "1px solid #EBEBEB" }}
      >
        <div className="max-w-xl mx-auto px-6 md:px-10">
          <AnimatedSection className="mb-10 text-center">
            <span className="eyebrow">Get started</span>
            <h2 className="section-heading mt-0.5 mb-3">
              Apply to sell on NOTMADE
            </h2>
            <p className="text-[15px]" style={{ color: "#777777" }}>
              Takes 2 minutes. We&apos;ll get back within 2–3 days.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E4",
                padding: "clamp(1.75rem, 5vw, 2.5rem)",
              }}
            >
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ
      ════════════════════════════════════ */}
      <section className="py-24 bg-white" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">FAQ</span>
            <h2 className="section-heading">Common questions.</h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div style={{ borderTop: "1px solid #EBEBEB" }}>
              {FAQS.map(({ q, a }, i) => (
                <details key={i} className="faq-item">
                  <summary className="flex items-start justify-between py-5 gap-6 cursor-pointer select-none">
                    <span className="text-[15px] font-semibold leading-snug" style={{ color: "#111111" }}>
                      {q}
                    </span>
                    <span className="faq-chevron flex-shrink-0" style={{ color: "#C41E2E" }}>+</span>
                  </summary>
                  <p className="pb-5 text-[14px] leading-relaxed" style={{ color: "#666666" }}>
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer className="py-16" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <span className="font-bebas text-[1.6rem] tracking-widest leading-none" style={{ color: "#FFFFFF" }}>
              NOTMADE
            </span>
            <p className="text-[13px]" style={{ color: "#888888" }}>
              <a href="mailto:admin@notmade.in" className="transition-colors hover:text-white" style={{ color: "#AAAAAA" }}>
                admin@notmade.in
              </a>
              {" · "}
              <a href="tel:+919354852701" className="transition-colors hover:text-white" style={{ color: "#AAAAAA" }}>
                +91 93548 52701
              </a>
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid #1E1E1E" }}
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
              <a href="/privacy-policy" className="transition-colors hover:text-white">Privacy</a>
              <a href="/terms"          className="transition-colors hover:text-white">Terms</a>
              <a href="/refund-policy"  className="transition-colors hover:text-white">Refund</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
