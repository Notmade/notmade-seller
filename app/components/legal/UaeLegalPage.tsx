import Link from "next/link";
import { ENTITY, type LegalDoc } from "@/app/legal/uae";

const OTHER = [
  { href: "/uae/terms", label: "Terms & Conditions" },
  { href: "/uae/privacy-policy", label: "Privacy Policy" },
  { href: "/uae/refund-policy", label: "Refund Policy" },
];

const H2 = "font-bebas text-2xl tracking-wider text-white mb-4";

/** Legal page for UAE sellers. Same look as the India pages. */
export default function UaeLegalPage({ doc, path }: { doc: LegalDoc; path: string }) {
  return (
    <main className="bg-[#080808] text-white min-h-screen">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#080808]/95 backdrop-blur-sm border-b border-[#111111]">
        <Link href="/uae" className="font-bebas text-2xl tracking-widest text-white hover:text-[#CC0000] transition-colors">NOTMADE</Link>
        <Link href="/uae" className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest uppercase font-semibold">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="font-bebas text-[#CC0000] tracking-[0.4em] text-sm mb-3">LEGAL</p>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wider leading-none mb-4">{doc.title}</h1>
          <p className="text-gray-400 text-base leading-relaxed">{doc.intro}</p>
          <p className="text-gray-600 text-xs mt-3">{ENTITY.name}</p>
        </div>

        <div className="space-y-10 text-sm text-gray-400 leading-relaxed">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className={H2}>{s.heading}</h2>
              {s.paras?.map((p) => <p key={p} className="mb-3">{p}</p>)}
              {s.items && (
                <ul className="space-y-2 pl-4">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-3"><span className="text-[#CC0000] flex-shrink-0 mt-0.5">—</span>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section>
            <h2 className={H2}>CONTACT</h2>
            <p>
              <a href={`mailto:${ENTITY.email}`} className="text-[#CC0000] hover:underline">{ENTITY.email}</a> or{" "}
              <a href={`tel:${ENTITY.phone}`} className="text-[#CC0000] hover:underline">{ENTITY.phone}</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2026 {ENTITY.name}. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            {OTHER.filter((o) => o.href !== path).map((o) => (
              <Link key={o.href} href={o.href} className="hover:text-white transition-colors">{o.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
