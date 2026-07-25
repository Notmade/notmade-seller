import AnimatedSection from "./components/AnimatedSection";
import CounterStats from "./components/CounterStats";
import ApplyForm from "./components/ApplyForm";

const WHO_WE_WORK_WITH = [
  {
    title: "Independent Labels",
    desc: "You've built something real. We help you sell it.",
  },
  {
    title: "Small Batch Makers",
    desc: "50 pieces or 500. We work with what you make.",
  },
  {
    title: "Delhi NCR Brands",
    desc: "Your customers get 2-hour delivery. No other platform offers this.",
  },
  {
    title: "Pan India Sellers",
    desc: "Not in Delhi? We ship nationwide. Your brand, everywhere.",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Apply",
    desc: "Fill out the form below. Shouldn't take more than 2 minutes.",
  },
  {
    num: "02",
    title: "We review it",
    desc: "We read every application ourselves. You'll hear back in 2–3 days.",
  },
  {
    num: "03",
    title: "Quick onboarding",
    desc: "KYC and product photos. Our team walks you through the whole thing.",
  },
  {
    num: "04",
    title: "You're live",
    desc: "Products go live within 2 hours of approval. That's it.",
  },
];

const THE_NUMBERS = [
  {
    value: "12–14%",
    label: "That's our commission. Nothing else.",
  },
  {
    value: "₹0",
    label: "Setup fee. Monthly fee. Hidden charges.",
  },
  {
    value: "2 hrs",
    label: "Time to go live after onboarding.",
  },
  {
    value: "24 hrs",
    label: "Our support response time.",
  },
];

const TC_ITEMS = [
  "12–14% commission on each completed sale",
  "NOTMADE handles all customer communication",
  "Products must be original and authentic",
  "Minimum quality standards as per NOTMADE guidelines",
  "Payments processed monthly",
  "NOTMADE reserves the right to remove listings that don't meet standards",
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#0A0A0A" }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #1A1A1A",
        }}
      >
        <span className="font-bebas text-2xl tracking-widest" style={{ color: "#F4F1EC" }}>
          NOTMADE
        </span>
        <a
          href="#apply"
          className="btn-red font-bebas text-sm tracking-widest px-5 py-2.5"
        >
          Apply Now
        </a>
      </nav>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO (dark)
      ══════════════════════════════════════ */}
      <section
        className="px-6 pt-36 pb-24"
        style={{ background: "#0A0A0A" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Seller Programme · Open</span>

          <h1
            className="font-bebas text-balance"
            style={{
              fontSize: "clamp(2.75rem, 5.5vw, 4.75rem)",
              lineHeight: 1.08,
              color: "#F4F1EC",
              marginBottom: "1.5rem",
            }}
          >
            Your brand deserves<br />better distribution.
          </h1>

          <p
            className="leading-[1.75] max-w-xl mx-auto"
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)",
              color: "#888888",
              marginBottom: "2.5rem",
            }}
          >
            NOTMADE gives independent labels direct access to Delhi
            NCR&apos;s streetwear buyers — with same-day delivery, zero
            setup cost, and a team that actually picks up the phone.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a
              href="#apply"
              className="btn-red font-bebas text-lg tracking-widest px-10 py-4"
            >
              Apply Now →
            </a>
            <a
              href="#how-it-works"
              className="btn-ghost-cream font-bebas text-lg tracking-widest px-10 py-4"
            >
              How It Works
            </a>
          </div>

          <CounterStats />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — WHO WE WORK WITH (white)
      ══════════════════════════════════════ */}
      <section
        className="px-6 py-24"
        style={{ background: "#FFFFFF" }}
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">Who can apply</span>
            <h2
              className="font-bebas"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.1,
                color: "#111111",
                marginBottom: "0.75rem",
              }}
            >
              Who we work with
            </h2>
            <p
              className="leading-relaxed max-w-md"
              style={{ fontSize: "0.9375rem", color: "#666666" }}
            >
              10 years in or 10 months. If you make something real and you
              own it, there&apos;s a place for you here.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHO_WE_WORK_WITH.map(({ title, desc }, i) => (
              <AnimatedSection key={title} delay={i * 70}>
                <div className="card-light p-8">
                  <h3
                    className="font-bebas text-xl tracking-wider mb-3"
                    style={{ color: "#111111" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize: "0.9375rem", color: "#666666" }}
                  >
                    {desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — HOW IT WORKS (dark)
      ══════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="px-6 py-24"
        style={{ background: "#0A0A0A" }}
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">The process</span>
            <h2
              className="font-bebas"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.1,
                color: "#F4F1EC",
              }}
            >
              How it works
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map(({ num, title, desc }, i) => (
              <AnimatedSection key={num} delay={i * 80}>
                <div className="card-dark p-8">
                  <div
                    className="font-bebas text-5xl leading-none mb-5"
                    style={{ color: "rgba(204,0,0,0.25)" }}
                  >
                    {num}
                  </div>
                  <h3
                    className="font-bebas text-xl tracking-wider mb-3"
                    style={{ color: "#F4F1EC" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize: "0.9375rem", color: "#888888" }}
                  >
                    {desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — THE NUMBERS (light grey)
      ══════════════════════════════════════ */}
      <section
        className="px-6 py-24"
        style={{ background: "#F5F5F5" }}
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="mb-12">
            <span className="eyebrow">By the numbers</span>
            <h2
              className="font-bebas"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.1,
                color: "#111111",
              }}
            >
              What it actually costs
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
                 style={{ background: "#DDDDDD" }}>
              {THE_NUMBERS.map(({ value, label }, i) => (
                <div
                  key={i}
                  className="px-8 py-10"
                  style={{ background: "#F5F5F5" }}
                >
                  <div
                    className="font-bebas leading-none mb-3"
                    style={{
                      fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                      color: "#CC0000",
                    }}
                  >
                    {value}
                  </div>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize: "0.875rem", color: "#666666" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — APPLY FORM (dark)
      ══════════════════════════════════════ */}
      <section
        id="apply"
        className="px-6 py-24"
        style={{ background: "#0A0A0A" }}
      >
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="mb-10">
            <span className="eyebrow">Get started</span>
            <h2
              className="font-bebas mb-3"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                lineHeight: 1.1,
                color: "#F4F1EC",
              }}
            >
              Apply in 2 minutes.
            </h2>
            <p
              className="leading-[1.7]"
              style={{ fontSize: "0.9375rem", color: "#888888" }}
            >
              We read every application ourselves. If it&apos;s a fit,
              you&apos;ll hear back within 2–3 working days.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div
              style={{
                background: "#0F0F0F",
                border: "1px solid #1E1E1E",
                padding: "clamp(2rem, 5vw, 2.75rem)",
              }}
            >
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — T&C
      ══════════════════════════════════════ */}
      <section
        className="px-6 py-10"
        style={{ background: "#111111", borderTop: "1px solid #1A1A1A" }}
      >
        <div className="max-w-2xl mx-auto">
          <details className="group" style={{ border: "1px solid #1E1E1E" }}>
            <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none gap-4">
              <div className="flex items-baseline gap-3">
                <span
                  className="font-bebas text-lg tracking-wider"
                  style={{ color: "#F4F1EC" }}
                >
                  Seller Terms
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "#555555" }}
                >
                  Plain English
                </span>
              </div>
              <span
                className="text-xl flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
                style={{ color: "#CC0000" }}
              >
                +
              </span>
            </summary>
            <div
              className="px-6 pb-6"
              style={{ borderTop: "1px solid #1A1A1A" }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em] mt-5 mb-4"
                style={{ color: "#555555" }}
              >
                By applying, you agree to:
              </p>
              <ul className="space-y-3">
                {TC_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 leading-relaxed"
                    style={{ fontSize: "0.875rem", color: "#888888" }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#CC0000" }}
                    >
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER (dark)
      ══════════════════════════════════════ */}
      <footer
        className="px-6 py-14"
        style={{ background: "#0A0A0A", borderTop: "1px solid #1A1A1A" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <span
              className="font-bebas text-3xl tracking-widest"
              style={{ color: "#F4F1EC" }}
            >
              NOTMADE
            </span>
            <div
              className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm"
              style={{ color: "#888888" }}
            >
              <a
                href="mailto:admin@notmade.in"
                className="transition-colors hover:text-white"
                style={{ color: "#888888" }}
              >
                admin@notmade.in
              </a>
              <span className="hidden sm:inline" style={{ color: "#333" }}>·</span>
              <a
                href="tel:+919354852701"
                className="transition-colors hover:text-white"
                style={{ color: "#888888" }}
              >
                +91 93548 52701
              </a>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid #1A1A1A" }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "#444444" }}
            >
              © 2026 NOTMADE. All rights reserved.
            </p>
            <div
              className="flex gap-5 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "#444444" }}
            >
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms"          className="hover:text-white transition-colors">Terms</a>
              <a href="/refund-policy"  className="hover:text-white transition-colors">Refunds</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
