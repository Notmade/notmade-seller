import AnimatedSection from "./components/AnimatedSection";
import CounterStats from "./components/CounterStats";
import ApplyForm from "./components/ApplyForm";

const WHO_WE_SUPPORT = [
  {
    icon: "🎨",
    title: "Independent Brands",
    desc: "Got a brand with a vision? Bring it here. We'll handle the reach.",
  },
  {
    icon: "🏭",
    title: "Small Batch Makers",
    desc: "You make 50 pieces. We make sure they sell out.",
  },
  {
    icon: "⚡",
    title: "Delhi NCR Sellers",
    desc: "List with us and your customers get 2-hour delivery. No other platform does this.",
  },
  {
    icon: "🌏",
    title: "Pan India Sellers",
    desc: "Not in Delhi? No problem. We ship nationwide in 3–5 days.",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "APPLY",
    desc: "Fill the form below. Takes 2 minutes. Tell us what you make.",
  },
  {
    num: "02",
    title: "REVIEW",
    desc: "We read every application ourselves. No auto-rejections. 2–3 days.",
  },
  {
    num: "03",
    title: "ONBOARD",
    desc: "Quick KYC + product photos. Our team walks you through everything.",
  },
  {
    num: "04",
    title: "GO LIVE",
    desc: "Your products are live within 2 hours of onboarding approval.",
  },
];

const THE_NUMBERS = [
  { value: "12–14%", label: "Commission per sale" },
  { value: "₹0",    label: "Setup or monthly fees" },
  { value: "2 HRS", label: "To go live after approval" },
  { value: "2–3",   label: "Days to review application" },
  { value: "Monthly", label: "Payout cycle" },
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
    <main style={{ background: "var(--bg)", color: "var(--cream)" }} className="min-h-screen">

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(204,0,0,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bebas text-2xl tracking-widest" style={{ color: "var(--cream)" }}>
            NOTMADE
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
            <span className="live-dot" />
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#00FF88" }}>
              Taking Applications
            </span>
          </div>
        </div>
        <a href="#apply" className="btn-glow font-bebas text-sm tracking-widest px-6 py-2.5 rounded-full" style={{ color: "#fff" }}>
          APPLY NOW
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24 grid-bg">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%)" }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.8) 100%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: "rgba(204,0,0,0.08)", border: "1px solid rgba(204,0,0,0.2)" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#CC0000" }}>
              Seller Programme · Open
            </span>
          </div>

          <h1 className="font-bebas leading-none tracking-wider" style={{ fontSize: "clamp(4rem,13vw,10.5rem)", color: "var(--cream)" }}>
            YOUR BRAND.
            <br />
            <span style={{ color: "#CC0000" }}>OUR STREETS.</span>
          </h1>

          <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light" style={{ color: "rgba(244,241,236,0.55)" }}>
            The fastest way to get your brand in front of Delhi&apos;s streetwear culture.
            <br className="hidden sm:block" />
            We handle everything. You just ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a href="#apply" className="btn-glow font-bebas text-xl tracking-widest px-12 py-4 rounded-full w-full sm:w-auto text-center" style={{ color: "#fff" }}>
              APPLY NOW →
            </a>
            <a href="#how-it-works" className="btn-outline font-bebas text-xl tracking-widest px-12 py-4 rounded-full w-full sm:w-auto text-center">
              HOW IT WORKS
            </a>
          </div>

          <CounterStats />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: 0.25 }}>
          <span className="font-mono text-[9px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, var(--cream), transparent)" }} />
        </div>
      </section>

      {/* ── WHO WE SUPPORT ── */}
      <section className="py-28 px-6" style={{ borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#CC0000" }}>
              WHO CAN APPLY
            </span>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider" style={{ color: "var(--cream)" }}>
              WHO WE SUPPORT
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "rgba(244,241,236,0.45)" }}>
              10 years in or 10 months — if you make something real and you own it, you belong here.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHO_WE_SUPPORT.map(({ icon, title, desc }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="glass-card h-full p-7 flex items-start gap-5">
                  <div className="text-3xl flex-shrink-0 mt-0.5">{icon}</div>
                  <div>
                    <h3 className="font-bebas text-xl tracking-wider mb-2" style={{ color: "var(--cream)" }}>
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(244,241,236,0.5)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#CC0000" }}>
              The Process
            </span>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider" style={{ color: "var(--cream)" }}>
              HOW IT WORKS
            </h2>
          </AnimatedSection>

          {/* Desktop horizontal timeline */}
          <AnimatedSection>
            <div className="relative">
              {/* Connecting line (desktop only) */}
              <div
                className="hidden lg:block absolute h-px"
                style={{
                  top: "28px",
                  left: "calc(12.5% + 4px)",
                  right: "calc(12.5% + 4px)",
                  background: "linear-gradient(90deg, rgba(204,0,0,0.15), rgba(204,0,0,0.5) 50%, rgba(204,0,0,0.15))",
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {HOW_IT_WORKS.map(({ num, title, desc }, i) => (
                  <div
                    key={num}
                    className="flex flex-col items-center text-center group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Step circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-5 font-bebas text-xl tracking-wider transition-all duration-300 relative z-10"
                      style={{
                        background: "rgba(204,0,0,0.08)",
                        border: "1px solid rgba(204,0,0,0.3)",
                        color: "#CC0000",
                      }}
                    >
                      <span
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "rgba(204,0,0,0.12)", boxShadow: "0 0 20px rgba(204,0,0,0.4)" }}
                      />
                      <span className="relative">{num}</span>
                    </div>

                    <h3 className="font-bebas text-lg tracking-widest mb-2" style={{ color: "var(--cream)" }}>
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(244,241,236,0.45)" }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── THE NUMBERS ── */}
      <section className="py-24 px-6" style={{ background: "var(--bg)", borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#CC0000" }}>
              By The Numbers
            </span>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider" style={{ color: "var(--cream)" }}>
              THE NUMBERS
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ background: "rgba(204,0,0,0.08)" }}>
              {THE_NUMBERS.map(({ value, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center px-6 py-10 group transition-all duration-300"
                  style={{ background: "var(--bg)" }}
                >
                  <div
                    className="stat-number mb-3 transition-all duration-300 group-hover:scale-105"
                    style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
                  >
                    {value}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <section id="apply" className="py-28 px-6 relative overflow-hidden" style={{ borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        {/* Ambient glows */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] pointer-events-none -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(204,0,0,0.05) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] pointer-events-none -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(204,0,0,0.03) 0%, transparent 70%)" }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-12 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#CC0000" }}>
              Get In
            </span>
            <h2 className="font-bebas tracking-wider" style={{ fontSize: "clamp(3rem,8vw,6rem)", color: "var(--cream)" }}>
              JOIN THE MOVEMENT
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(244,241,236,0.45)" }}>
              Takes 2 minutes. We read every single application ourselves.
              <br />
              Hear back in 2–3 working days.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={120}>
            <div className="form-card p-8 md:p-10" style={{ border: "1px solid rgba(204,0,0,0.15)" }}>
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── T&C ── */}
      <section className="py-12 px-6" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        <div className="max-w-2xl mx-auto">
          <details className="group" style={{ border: "1px solid rgba(204,0,0,0.12)", background: "rgba(15,15,15,0.8)" }}>
            <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none">
              <div>
                <span className="font-bebas text-lg tracking-widest" style={{ color: "var(--cream)" }}>
                  THE RULES
                </span>
                <span className="font-mono text-[10px] ml-3 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Plain English
                </span>
              </div>
              <span className="text-xl flex-shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ color: "#CC0000" }}>
                +
              </span>
            </summary>
            <div className="px-6 pb-6" style={{ borderTop: "1px solid rgba(204,0,0,0.08)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] mt-4 mb-4" style={{ color: "var(--muted)" }}>
                By applying, you agree to:
              </p>
              <ul className="space-y-3">
                {TC_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "rgba(244,241,236,0.55)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "#CC0000" }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(204,0,0,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span className="font-bebas text-3xl tracking-widest" style={{ color: "var(--cream)" }}>
              NOTMADE
            </span>
            <div className="text-sm space-y-1" style={{ color: "rgba(244,241,236,0.4)" }}>
              <p>
                <a href="mailto:admin@notmade.in" className="transition-colors hover:text-white" style={{ color: "rgba(244,241,236,0.55)" }}>
                  admin@notmade.in
                </a>
                <span className="mx-2" style={{ color: "rgba(204,0,0,0.4)" }}>·</span>
                <a href="tel:+919354852701" className="transition-colors hover:text-white" style={{ color: "rgba(244,241,236,0.55)" }}>
                  +91 93548 52701
                </a>
              </p>
            </div>
          </div>
          <div className="red-divider mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              © 2026 NOTMADE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/refund-policy" className="hover:text-white transition-colors">Refunds</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
