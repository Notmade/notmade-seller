import ApplyForm from "./components/ApplyForm";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply",
    desc: "Fill out the application below. Tell us about your brand, your craft, and what makes it different.",
  },
  {
    step: "02",
    title: "Get Reviewed",
    desc: "Our team manually reviews every application. We're curated by design — not everyone gets in.",
  },
  {
    step: "03",
    title: "List & Sell",
    desc: "Once approved, set up your seller profile, list your drops, and start selling to our community.",
  },
  {
    step: "04",
    title: "Get Paid",
    desc: "Instant payouts after each order. No waiting. No hidden fees. Your money, on your terms.",
  },
];

const WHY_NOTMADE = [
  {
    icon: "◈",
    title: "Curated Community",
    desc: "We don't let everyone in. That exclusivity drives demand for the brands that make the cut.",
  },
  {
    icon: "◉",
    title: "Zero Upfront Cost",
    desc: "No listing fees. No monthly subscriptions. We only make money when you make money.",
  },
  {
    icon: "◐",
    title: "Built for the Culture",
    desc: "Every buyer on NOTMADE is here for streetwear, not bargain hunting. Your audience is already here.",
  },
  {
    icon: "◇",
    title: "Full Brand Control",
    desc: "Your brand page, your pricing, your story. We handle logistics — you handle the vision.",
  },
  {
    icon: "◆",
    title: "Direct WhatsApp Support",
    desc: "No tickets. No chatbots. A dedicated seller success manager on WhatsApp, always.",
  },
  {
    icon: "◑",
    title: "Fast Payouts",
    desc: "Settlements within 24 hours of delivery confirmation. Because cash flow matters.",
  },
];

const FAQS = [
  {
    q: "Who can apply to sell on NOTMADE?",
    a: "Any independent brand, designer, or creator making original streetwear, accessories, footwear, or related culture products. We accept both established brands and emerging ones — what matters is the quality and authenticity of what you make.",
  },
  {
    q: "Is there a fee to apply or list products?",
    a: "No. Applying is free. Listing is free. NOTMADE takes a commission only on completed sales — no hidden charges, no subscriptions.",
  },
  {
    q: "How long does the review process take?",
    a: "Typically 24–48 hours after you submit your application. We'll reach out via WhatsApp with next steps.",
  },
  {
    q: "Do I need to be an established brand?",
    a: "No. We work with brands at every stage — from first drops to seasoned labels. If the product is right, we want you on the platform.",
  },
  {
    q: "Who handles shipping and logistics?",
    a: "You ship your orders directly to buyers. NOTMADE provides a streamlined order management dashboard, and our team supports you through the process.",
  },
  {
    q: "Can I sell vintage or resell items?",
    a: "Yes, we have a vintage/resell category. Items must be authentic, accurately described, and meet our quality standards.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#080808] text-white min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#080808]/90 backdrop-blur-sm border-b border-[#111111]">
        <span className="font-bebas text-2xl tracking-widest text-white">
          NOTMADE
        </span>
        <a
          href="#apply"
          className="bg-[#CC0000] hover:bg-[#A00000] text-white font-bebas text-sm tracking-widest px-5 py-2 transition-colors"
        >
          APPLY NOW
        </a>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#CC0000 1px, transparent 1px), linear-gradient(90deg, #CC0000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CC0000]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm md:text-base">
            NOTMADE SELLER PROGRAM
          </p>
          <h1 className="font-bebas text-[clamp(4rem,12vw,10rem)] leading-none tracking-wider text-white">
            YOUR BRAND.
            <br />
            <span className="text-[#CC0000]">OUR STREETS.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
            NOTMADE is India&apos;s curated marketplace for street culture.
            We&apos;re building the home for independent brands that don&apos;t
            fit the mainstream — and we want your brand in it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#apply"
              className="bg-[#CC0000] hover:bg-[#A00000] text-white font-bebas text-lg tracking-widest px-10 py-4 transition-colors w-full sm:w-auto text-center"
            >
              APPLY TO SELL
            </a>
            <a
              href="#how-it-works"
              className="border border-[#333333] hover:border-[#CC0000] text-white font-bebas text-lg tracking-widest px-10 py-4 transition-colors w-full sm:w-auto text-center"
            >
              HOW IT WORKS
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-widest font-bebas">SCROLL</span>
          <div className="w-px h-10 bg-white/40" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-[#111111] bg-[#0D0D0D] py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "50+", label: "Active Brands" },
            { num: "10K+", label: "Buyers" },
            { num: "0%", label: "Listing Fee" },
            { num: "24H", label: "Payout Time" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-bebas text-4xl md:text-5xl text-[#CC0000] tracking-wider">
                {num}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              THE PROCESS
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#111111]">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-[#080808] p-8 group hover:bg-[#0D0D0D] transition-colors"
              >
                <div className="font-bebas text-6xl text-[#CC0000]/20 group-hover:text-[#CC0000]/40 transition-colors leading-none mb-4">
                  {step}
                </div>
                <h3 className="font-bebas text-2xl tracking-widest text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NOTMADE */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              THE REASON
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              WHY NOTMADE
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              There are a hundred places to sell online. Only one that was built
              for the culture, by the culture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#151515]">
            {WHY_NOTMADE.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#0A0A0A] p-8 group hover:bg-[#0F0F0F] transition-colors"
              >
                <div className="text-[#CC0000] text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {icon}
                </div>
                <h3 className="font-bebas text-xl tracking-wider text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLY FORM */}
      <section id="apply" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CC0000] to-transparent opacity-30" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#CC0000]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              GET IN
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              APPLY NOW
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              Applications are reviewed manually. We&apos;ll get back to you on
              WhatsApp within 48 hours.
            </p>
          </div>

          <div className="border border-[#1A1A1A] bg-[#0C0C0C] p-8 md:p-10">
            <ApplyForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm">
              QUESTIONS
            </p>
            <h2 className="font-bebas text-5xl md:text-7xl tracking-wider">
              FAQ
            </h2>
          </div>

          <div className="space-y-px">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-[#0A0A0A] border border-[#111111] hover:border-[#1A1A1A] transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none">
                  <span className="font-semibold text-sm text-white pr-4">
                    {q}
                  </span>
                  <span className="text-[#CC0000] text-xl flex-shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#CC0000]/5" />
        <div className="absolute inset-0 border-y border-[#CC0000]/10" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="font-bebas text-[clamp(3rem,8vw,6rem)] leading-none tracking-wider">
            READY TO GET ON THE STREETS?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            Limited spots available. We&apos;re growing carefully to protect the
            quality of the marketplace.
          </p>
          <a
            href="#apply"
            className="inline-block bg-[#CC0000] hover:bg-[#A00000] text-white font-bebas text-xl tracking-widest px-12 py-5 transition-colors"
          >
            APPLY TO SELL
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#111111] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bebas text-xl tracking-widest text-white">
            NOTMADE
          </span>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} NOTMADE LLP. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
