"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MARKETS, MARKET_COOKIE, DEFAULT_MARKET, getMarket, isMarketCode, type Market, type MarketCode } from "@/src/config/markets";

export function Flag({ market, size = 20 }: { market: Market; size?: number }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 30 20" aria-hidden className="s-flag"
      dangerouslySetInnerHTML={{ __html: market.flag }} />
  );
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${MARKET_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function writeMarketCookie(code: MarketCode) {
  document.cookie = `${MARKET_COOKIE}=${code}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
}

/** Current market: ?market=… wins, then the cookie, then the default. Changing it updates both. */
export function useMarket(): [Market, (code: MarketCode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = params.get("market");
  const [cookie, setCookie] = useState<string | null>(null);

  useEffect(() => { setCookie(readCookie()); }, []);
  useEffect(() => { if (isMarketCode(fromUrl)) writeMarketCookie(fromUrl); }, [fromUrl]);

  const code = isMarketCode(fromUrl) ? fromUrl : isMarketCode(cookie) ? cookie : DEFAULT_MARKET;

  const setMarket = (next: MarketCode) => {
    writeMarketCookie(next);
    setCookie(next);
    const q = new URLSearchParams(params.toString());
    q.set("market", next);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  return [getMarket(code), setMarket];
}

export function MarketSwitcher({ value, onChange, compact = false }: {
  value: Market; onChange: (code: MarketCode) => void; compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <div ref={ref} className="s-switch">
      <button type="button" className="s-switch-btn" aria-haspopup="listbox" aria-expanded={open}
        aria-label={`Selling from: ${value.name}. Change country`} onClick={() => setOpen(o => !o)}>
        <Flag market={value} size={14} />
        <span className={compact ? "s-switch-name s-hide-sm" : "s-switch-name"}>{value.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" aria-label="Country" className="s-switch-list">
          {MARKETS.map(m => (
            <li key={m.code} role="option" aria-selected={m.code === value.code}>
              <button type="button" className="s-switch-opt" onClick={() => { setOpen(false); onChange(m.code); }}>
                <Flag market={m} size={14} />
                <span style={{ flex: 1 }}>{m.name}</span>
                <span className="s-switch-tag">{m.open ? "Open" : "Waitlist"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Switcher bound to the URL/cookie market. Used in the landing header. */
export function UrlMarketSwitcher({ compact }: { compact?: boolean }) {
  const [market, setMarket] = useMarket();
  return <MarketSwitcher value={market} onChange={setMarket} compact={compact} />;
}

export function Waitlist({ market }: { market: Market }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, market: market.code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (status === "done") {
    return <p className="s-note" role="status">Thanks. We will email you when seller accounts open for {market.name === "Global" ? "your country" : market.name}.</p>;
  }

  return (
    <form onSubmit={submit} className="s-waitlist">
      <label htmlFor={`wl-${market.code}`} className="s-sr">Email address</label>
      <input id={`wl-${market.code}`} type="email" required autoComplete="email" placeholder="you@brand.com"
        value={email} onChange={e => setEmail(e.target.value)} className="s-input" />
      <button type="submit" className="s-btn s-btn-red" disabled={status === "loading"}>
        {status === "loading" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && <p className="s-err" role="alert">{msg}</p>}
    </form>
  );
}
