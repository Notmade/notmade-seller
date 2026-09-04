import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — NOTMADE",
  description: "How NOTMADE collects and uses your information.",
};

export default function PrivacyPolicy() {
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
            PRIVACY POLICY
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            We keep it simple. Here&apos;s what we collect and why.
          </p>
          <p className="text-gray-600 text-xs mt-3">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-10 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              WHAT WE COLLECT
            </h2>
            <p className="mb-3">
              When you apply to sell on NOTMADE, we collect:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Your name and brand name",
                "WhatsApp number and email address",
                "Business category and city/state",
                "GST number (if provided)",
                "Instagram handle (if provided)",
                "Information about your brand you share in the application",
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
              HOW WE USE IT
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "To review your seller application",
                "To contact you about your application status",
                "To onboard approved sellers onto the platform",
                "To send monthly payout reports and operational updates",
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
              WHAT WE DON&apos;T DO
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "We never sell your data to third parties",
                "We don't share your personal information with advertisers",
                "We don't use your data for anything outside running NOTMADE",
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
              DATA STORAGE
            </h2>
            <p>
              Your application data is stored securely on our servers. We retain
              it as long as your account is active or as needed to operate the
              platform. If you want your data deleted, email us and
              we&apos;ll sort it out.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              CONTACT
            </h2>
            <p>
              Questions about privacy? Email us:{" "}
              <a
                href="mailto:admin@notmade.in"
                className="text-[#CC0000] hover:underline"
              >
                admin@notmade.in
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2026 NOTMADE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
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
