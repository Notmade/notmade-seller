import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — NOTMADE",
  description: "Seller terms and conditions for the NOTMADE platform.",
};

export default function Terms() {
  return (
    <main className="bg-[#080808] text-white min-h-screen">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#080808]/95 backdrop-blur-sm border-b border-[#111111]">
        <Link
          href="/"
          className="font-bebas text-2xl tracking-widest text-white hover:text-[#CC0000] transition-colors"
        >
          NOTMADE
        </Link>
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest uppercase font-semibold"
        >
          ← Back
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm mb-3">
            LEGAL
          </p>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wider leading-none mb-4">
            TERMS &amp; CONDITIONS
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            The rules. Plain English.
          </p>
          <p className="text-gray-600 text-xs mt-3">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-10 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              COMMISSION
            </h2>
            <p>
              NOTMADE charges a commission of{" "}
              <span className="text-white font-medium">17% flat per completed sale</span>.
              That&apos;s the only fee. No setup fee, no listing fee, no monthly
              subscription. You get paid when a customer places and receives an
              order.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              PAYMENTS
            </h2>
            <p className="mb-3">
              Payouts are processed{" "}
              <span className="text-white font-medium">monthly</span>. You&apos;ll
              receive a breakdown of all orders, commissions deducted, and the
              amount transferred to your bank account. If there&apos;s a
              discrepancy, reach out — we&apos;ll sort it out.
            </p>
            <p>
              NOTMADE reserves the right to withhold payments in cases of fraud,
              policy violations, or unresolved disputes.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              YOUR PRODUCTS, OUR PLATFORM
            </h2>
            <p className="mb-3">
              You own your products, your designs, your brand. NOTMADE owns the
              platform, the customer relationships, and the distribution
              infrastructure.
            </p>
            <p>
              By listing on NOTMADE, you grant us a non-exclusive licence to
              display and market your products on the platform and through our
              channels.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              QUALITY STANDARDS
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "All products must be original and authentic",
                "Products must match the description and photos provided",
                "Minimum 10 products required to list on the platform",
                "NOTMADE reserves the right to remove any listing that doesn't meet quality standards — we'll tell you why",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#CC0000] flex-shrink-0 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              DISPUTES
            </h2>
            <p>
              If there&apos;s a problem — with an order, a payout, or anything
              else — contact us first:{" "}
              <a
                href="mailto:admin@notmade.in"
                className="text-[#CC0000] hover:underline"
              >
                admin@notmade.in
              </a>{" "}
              or{" "}
              <a
                href="tel:+919354852701"
                className="text-[#CC0000] hover:underline"
              >
                +91 93548 52701
              </a>
              . We resolve most disputes within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              GOVERNING LAW
            </h2>
            <p>
              These terms are governed by the laws of India. Any disputes are
              subject to the jurisdiction of courts in Delhi.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              CHANGES TO THESE TERMS
            </h2>
            <p>
              We may update these terms from time to time. If something
              significant changes, we&apos;ll notify sellers via email before it
              takes effect.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2026 NOTMADE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
