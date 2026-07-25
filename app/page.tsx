import AnimatedSection from "./components/AnimatedSection";
import CounterStats from "./components/CounterStats";
import ApplyForm from "./components/ApplyForm";

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Apply in 2 Minutes",
    desc: "Takes 2 minutes. Just tell us what you make and where you're from.",
  },
  {
    step: "02",
    title: "We Review in 2–3 Days",
    desc: "We read every application ourselves. No algorithms, no auto-rejections. You'll hear from us in 2–3 days.",
  },
  {
    step: "03",
    title: "Share KYC + Products",
    desc: "Quick KYC, product photos, pricing. Our team walks you through it — usually done in a day.",
  },
  {
    step: "04",
    title: "Go Live in 2 Hours",
    desc: "2 hours. That's all it takes to go live on NOTMADE. Delhi NCR sellers also unlock same-day delivery.",
  },
];

const WHO_WE_SUPPORT = [
  { icon: "◈", text: "Independent streetwear brands" },
  { icon: "◉", text: "Small batch manufacturers" },
  {
    icon: "◐",
    text: "Delhi NCR based preferred — you get 2-hour express delivery",
  },
  { icon: "◇", text: "Pan India sellers welcome" },
  { icon: "◆", text: "Minimum 10 products to list" },
];

const WHY_NOTMADE = [
  {
    icon: "◈",
    title: "12–14% Commission. That's It.",
    desc: "We don't take a cut of everything you do. Just 12% per sale. No registration fee, no listing fee, no monthly subscription.",
  },
  {
    icon: "◉",
    title: "₹0 to Get Started",
    desc: "Zero setup cost. We only make money when you make money. If you're not selling, we're not charging.",
  },
  {
    icon: "◐",
    title: "Your Products. Our Reach.",
    desc: "Marketing, customer support, delivery — we run all of it. You make the product, we do the rest.",
  },
  {
    icon: "◇",
    title: "Real Orders, Real Money",
    desc: "17+ orders delivered and counting. Real buyers, real money — not just followers on a page.",
  },
  {
    icon: "◆",
    title: "App Coming Soon",
    desc: "Our mobile app is in the works. When it drops, your products are already on it.",
  },
  {
    icon: "◑",
    title: "Monthly Payout Reports",
    desc: "Every month, a clean breakdown — what sold, what you earned, what's incoming. No spreadsheet headaches.",
  },
  {
    icon: "◫",
    title: "2-Hour WhatsApp Response",
    desc: "We reply within 2 hours on WhatsApp. Seriously. No bots, no ticket queues, no waiting.",
  },
];

const TIMELINE = [
  {
    day: "Day 1",
    title: "Apply",
    desc: "Submit the form below. Whole thing takes under 2 minutes.",
  },
  {
    day: "Day 2–3",
    title: "We Review It",
    desc: "We read every application ourselves. No automated filters.",
  },
  {
    day: "Day 3",
    title: "You Get an Email",
    desc: "A clear yes or no with next steps. No ghosting.",
  },
  {
    day: "Week 1",
    title: "KYC + Product Onboarding",
    desc: "Quick KYC and product catalogue. Our team handles the onboarding.",
  },
  {
    day: "Week 1",
    title: "Products Live",
    desc: "Within 2 hours of onboarding approval, you're on NOTMADE.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#080808] text-white min-h-screen">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#080808]/95 backdrop-blur-sm border-b border-[#111111]">
        <span className="font-bebas text-2xl tracking-widest text-white">
          NOTMADE
        </span>
        <a
          href="#apply"
          className="bg-[#CC0000] hover:bg-[#A00000] text-white font-bebas text-sm tracking-widest px-6 py-2.5 transition-colors duration-200"
        >
          APPLY NOW
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#CC0000 1px, transparent 1px), linear-gradient(90deg, #CC0000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#CC0000]/6 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <p className="font-bebas text-[#CC0000] tracking-[0.45em] text-sm md:text-base">
            NOTMADE SELLER PROGRAMME
          </p>
          <h1 className="font-bebas text-[clamp(4rem,13vw,10.5rem)] leading-none tracking-wider text-white">
            YOUR BRAND.
            <br />
            <span className="text-[#CC0000]">OUR STREETS.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
            Join NOTMADE&apos;s seller programme. We handle everything —
            marketing, delivery, customers. You just ship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#apply"
              className="bg-[#CC0000] hover:bg-[#A00000] text-white font-bebas text-xl tracking-widest px-12 py-4 transition-colors duration-200 w-full sm:w-auto text-center"
            >
              APPLY NOW →
            </a>
            <a
              href="#how-it-works"
              className="border border-[#333333] hover:border-[#CC0000] text-white font-bebas text-xl tracking-widest px-12 py-4 transition-colors duration-200 w-full sm:w-auto text-center"
            >
              HOW IT WORKS
            </a>
          </div>

          <CounterStats />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs tracking-widest font-bebas">SCROLL</span>
          <div className="w-px h-10 bg-white/40" />
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              THE PROCESS
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              HOW WE WORK
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              From form submission to live on the platform — most sellers are up
              within a week.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#111111]">
            {HOW_WE_WORK.map(({ step, title, desc }, i) => (
              <AnimatedSection key={step} delay={i * 100}>
                <div className="bg-[#080808] p-8 group hover:bg-[#0D0D0D] transition-all duration-300 h-full border-t-2 border-t-transparent hover:border-t-[#CC0000]">
                  <div className="font-bebas text-6xl text-[#CC0000]/20 group-hover:text-[#CC0000]/50 transition-colors leading-none mb-4">
                    {step}
                  </div>
                  <h3 className="font-bebas text-xl tracking-widest text-white mb-3">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SUPPORT ── */}
      <section className="py-24 px-6 bg-[#0A0A0A] border-y border-[#111111]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm mb-3">
              WHO CAN APPLY
            </p>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wider leading-none mb-6">
              WHO WE
              <br />
              SUPPORT
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              We don&apos;t care if you&apos;ve been making clothes for 10 years
              or 10 months. If you make something real and you own it, you
              belong here.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <ul className="space-y-3">
              {WHO_WE_SUPPORT.map(({ icon, text }, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 border border-[#1A1A1A] bg-[#0D0D0D] px-5 py-4 group hover:border-[#CC0000]/40 hover:bg-[#100808] transition-all duration-200"
                >
                  <span className="text-[#CC0000] text-base mt-0.5 flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-gray-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* ── WHY NOTMADE ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              THE REASON
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              WHY NOTMADE
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              We don&apos;t take a cut of everything you do. Just 12% per sale.
              That&apos;s it.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#151515]">
            {WHY_NOTMADE.map(({ icon, title, desc }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="bg-[#080808] p-8 group hover:bg-[#0D0D0D] transition-all duration-300 h-full border-l-2 border-l-transparent hover:border-l-[#CC0000]">
                  <div className="text-[#CC0000] text-2xl mb-4 group-hover:scale-110 transition-transform inline-block">
                    {icon}
                  </div>
                  <h3 className="font-bebas text-xl tracking-wider text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 px-6 bg-[#0A0A0A] border-y border-[#111111]">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-14 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              WHAT TO EXPECT
            </p>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wider">
              YOUR TIMELINE
            </h2>
          </AnimatedSection>

          <div className="relative space-y-0">
            {TIMELINE.map(({ day, title, desc }, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="flex gap-6 group">
                  <div className="flex flex-col items-center flex-shrink-0 w-24">
                    <div className="w-3 h-3 rounded-full bg-[#CC0000] mt-1 flex-shrink-0 group-hover:scale-150 group-hover:shadow-[0_0_8px_#CC0000] transition-all duration-300" />
                    {i < TIMELINE.length - 1 && (
                      <div className="w-px flex-1 bg-[#1A1A1A] my-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <span className="font-bebas text-[#CC0000] tracking-widest text-sm">
                      {day}
                    </span>
                    <h3 className="font-bebas text-xl tracking-wider text-white mt-0.5 mb-1">
                      {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <section id="apply" className="py-28 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CC0000]/40 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#CC0000]/4 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#CC0000]/3 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-2xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-12 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              GET IN
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              APPLY NOW
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              Fill this out in 2 minutes. We read every single application
              ourselves.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="border border-[#1A1A1A] bg-[#0C0C0C] p-8 md:p-10">
              <ApplyForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── TERMS & CONDITIONS ── */}
      <section className="py-12 px-6 bg-[#0A0A0A] border-t border-[#111111]">
        <div className="max-w-2xl mx-auto">
          <details className="group border border-[#1A1A1A] bg-[#0C0C0C]">
            <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none">
              <span className="font-bebas text-lg tracking-widest text-gray-300">
                SELLER TERMS & CONDITIONS
              </span>
              <span className="text-[#CC0000] text-xl flex-shrink-0 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-6 pb-6 border-t border-[#1A1A1A]">
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-4 mb-3">
                By applying, you agree to:
              </p>
              <ul className="space-y-2.5">
                {[
                  "12–14% commission on each completed sale",
                  "NOTMADE handles all customer communication",
                  "Products must be original and authentic",
                  "Minimum quality standards as per NOTMADE guidelines",
                  "Payments processed monthly",
                  "NOTMADE reserves the right to remove listings that don't meet standards",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-400"
                  >
                    <span className="text-[#CC0000] mt-0.5 flex-shrink-0">
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

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#111111] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <span className="font-bebas text-3xl tracking-widest text-white">
              NOTMADE
            </span>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Seller queries:{" "}
                <a
                  href="mailto:admin@notmade.in"
                  className="text-gray-300 hover:text-[#CC0000] transition-colors"
                >
                  admin@notmade.in
                </a>
              </p>
              <p>
                Phone:{" "}
                <a
                  href="tel:+919354852701"
                  className="text-gray-300 hover:text-[#CC0000] transition-colors"
                >
                  +91 93548 52701
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#111111]">
            <p className="text-gray-600 text-xs">
              © 2026 NOTMADE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6 text-xs text-gray-600">
              <a
                href="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms & Conditions
              </a>
              <a
                href="/refund-policy"
                className="hover:text-white transition-colors"
              >
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
