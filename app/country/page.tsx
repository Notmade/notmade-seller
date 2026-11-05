import type { Metadata } from "next";
import { Flag } from "../components/market";
import { MARKETS } from "@/src/config/markets";
import { NOINDEX } from "../lib/seo";

export const metadata: Metadata = { title: "Choose your country | NOTMADE Seller", ...NOINDEX };

/** Where a visitor picks a country. Neither landing page names the other country, so this page does. */
export default function ChooseCountry() {
  return (
    <main className="lg-main" style={{ minHeight: "100vh", background: "#FFF", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="lg-card" style={{ width: "100%", maxWidth: 420 }}>
        <h1 className="lg-h">Where is your business?</h1>
        <div className="lg-countries">
          {MARKETS.map((m) => (
            <a key={m.code} href={m.code === "ae" ? "/uae" : "/?market=in"}>
              <Flag market={m} size={20} />
              <span><strong>{m.name}</strong><small>Prices and payouts in {m.currency}</small></span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
