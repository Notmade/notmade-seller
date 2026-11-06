// Server-side reads for the landing pages. Both are public, cached for five minutes in this process,
// and fall back quietly so the page always renders.

import type { RateRow } from "../landing/content/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const TTL_MS = 5 * 60_000;
const TIMEOUT_MS = 2500;

const cache = new Map<string, { at: number; value: unknown }>();

async function getJson<T>(path: string): Promise<T | null> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T | null;
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    const value = res.ok ? ((await res.json()) as T) : null;
    cache.set(path, { at: Date.now(), value });
    return value;
  } catch {
    return hit ? (hit.value as T | null) : null;
  }
}

/** The public general rates from GET /seller/commission-rates. Null until the backend answers. */
export function loadPublicRates(): Promise<PublicRates | null> {
  return getJson<PublicRates>("/seller/commission-rates");
}

export interface PublicRates { india_pct?: number | null; uae_local_pct?: number | null }

/**
 * Applies the backend's rate to the `standard` line only. The public endpoint has one general rate per
 * country and no category lines, so every other line stays as written in the country file.
 */
export function withLiveStandardRate(rates: RateRow[], live: number | null | undefined): RateRow[] {
  const ok = typeof live === "number" && Number.isFinite(live) && live > 0 && live < 100;
  return ok ? rates.map((r) => (r.key === "standard" ? { ...r, pct: live } : r)) : rates;
}

/** What the UAE store has switched on, from GET /app/config?store=ae. Empty when it cannot be read. */
export async function loadUaePaymentConfig(): Promise<StorePaymentConfig> {
  const config = await getJson<StorePaymentConfig>("/app/config?store=ae");
  return { payment_methods: Array.isArray(config?.payment_methods) ? config.payment_methods : [], payments: config?.payments ?? null };
}

export interface ConfigPaymentMethod {
  id: string; type?: string; provider?: string | null; label?: string; enabled?: boolean; preview?: boolean;
}
export interface StorePaymentConfig {
  payment_methods?: ConfigPaymentMethod[];
  payments?: { online?: { enabled?: boolean; provider?: string | null } | null; cod?: { enabled?: boolean } | null } | null;
}

export interface PaymentOption { name: string; note: string }

const KNOWN: Record<string, PaymentOption> = {
  tabby: { name: "Tabby", note: "Pay later with Tabby." },
  tamara: { name: "Tamara", note: "Pay later with Tamara." },
};

/**
 * Only what the live config lists as enabled, nothing assumed. A cash-on-delivery entry carries no
 * flag of its own, so it follows payments.cod.enabled; any other method needs `enabled: true` on the
 * method itself and must not be a preview. `moreComing` is always shown: it names nothing.
 */
export function uaePaymentOptions(config: StorePaymentConfig | null | undefined): { options: PaymentOption[]; moreComing: boolean } {
  const options: PaymentOption[] = [];
  const onlineOn = config?.payments?.online?.enabled === true;
  const seen = new Set<string>();
  for (const m of config?.payment_methods ?? []) {
    if (m.type === "cod") continue;
    const id = String(m.provider ?? m.id).toLowerCase();
    if (m.enabled !== true || m.preview === true || !onlineOn || seen.has(id)) continue;
    seen.add(id);
    options.push(KNOWN[id] ?? { name: m.label || m.id, note: "Available at checkout." });
  }
  if (config?.payments?.cod?.enabled === true && config.payment_methods?.some((m) => m.type === "cod")) {
    options.push({ name: "Cash on delivery", note: "Pay when the order arrives." });
  }
  return { options, moreComing: true };
}
