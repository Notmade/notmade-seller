import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — NOTMADE",
  description: "How returns and refunds work on NOTMADE.",
};

export default function RefundPolicy() {
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
            REFUND POLICY
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Returns on NOTMADE are handled by us — not by sellers directly.
          </p>
          <p className="text-gray-600 text-xs mt-3">Last updated: July 2026</p>
        </div>

        <div className="space-y-10 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              HOW RETURNS WORK
            </h2>
            <p className="mb-3">
              When a customer wants to return a product, they contact NOTMADE —
              not the seller. We handle the entire return process: communication,
              logistics, and resolution.
            </p>
            <p>
              Sellers don&apos;t need to deal with customer disputes or
              logistics. That&apos;s our job.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              SELLER RESPONSIBILITY
            </h2>
            <p>
              Sellers are responsible for the quality of what they ship.
              Products must match the listing description, photos, and size
              specifications. If a return is due to a seller error — wrong size,
              wrong product, poor quality — the seller bears responsibility for
              that order.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              DAMAGED OR WRONG PRODUCT
            </h2>
            <ul className="space-y-3 pl-4">
              {[
                {
                  label: "Damaged product",
                  text: "NOTMADE covers the return cost and issues a refund or replacement to the customer. The seller's payout for that order is withheld.",
                },
                {
                  label: "Wrong product shipped",
                  text: "NOTMADE arranges a pickup and sends the correct item where possible. Seller payout is held until resolved.",
                },
                {
                  label: "Quality issue",
                  text: "If the product doesn't match what was listed, NOTMADE issues a full refund to the customer. Repeated quality issues result in listing removal.",
                },
              ].map(({ label, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#CC0000] flex-shrink-0 mt-0.5">—</span>
                  <span>
                    <span className="text-white font-medium">{label}: </span>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              CLEAN RETURNS
            </h2>
            <p>
              If a customer returns a product for a reason unrelated to seller
              error (e.g. changed their mind, size exchange), the customer
              receives a{" "}
              <span className="text-white font-medium">
                wallet credit on NOTMADE
              </span>{" "}
              equal to the order value. The seller&apos;s payout is adjusted
              accordingly.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              RETURN WINDOW
            </h2>
            <p>
              Customers have 48 hours from delivery to raise a return request
              for quality or wrong-item issues. Change-of-mind returns are
              subject to our platform policy at the time of the order.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              QUESTIONS
            </h2>
            <p>
              For return-related queries as a seller, reach us at:{" "}
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
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © 2026 NOTMADE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
