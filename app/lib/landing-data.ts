// Server-side reads for the UAE landing page. Both are public, cached for five minutes in this
// process, and fall back quietly so the page always renders.

import { resolveRateCard, type RateCardSource, type UaeRateCard } from "./rate-card";

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

export async function loadUaeRateCard(): Promise<UaeRateCard> {
  return resolveRateCard(await getJson<RateCardSource>("/seller/commission-rates"));
}

/** Payment methods the UAE store has switched on, from GET /app/config?store=ae. */
export async function loadUaePaymentMethods(): Promise<ConfigPaymentMethod[]> {
  const config = await getJson<{ payment_methods?: ConfigPaymentMethod[] }>("/app/config?store=ae");
  return Array.isArray(config?.payment_methods) ? config.payment_methods : [];
}

export interface ConfigPaymentMethod { id: string; type?: string; provider?: string | null; label?: string }

export interface PaymentOption { name: string; note: string }

/**
 * Cards and Tabby are always named. Anything beyond them appears only when it is switched on in the
 * store config, otherwise the page says more options are coming.
 */
export function uaePaymentOptions(methods: ConfigPaymentMethod[]): { options: PaymentOption[]; moreComing: boolean } {
  const options: PaymentOption[] = [
    { name: "Cards", note: "Secure online card payments." },
    { name: "Tabby", note: "Pay later with Tabby." },
  ];
  const known = new Set(["card", "cards", "tabby"]);
  const extras = methods.filter((m) => !known.has(String(m.provider ?? m.id).toLowerCase()) && m.type !== "cod");
  const seen = new Set<string>();
  for (const m of extras) {
    const id = String(m.provider ?? m.id).toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    options.push(id === "tamara"
      ? { name: "Tamara", note: "Pay later with Tamara." }
      : { name: m.label || m.id, note: "Available at checkout." });
  }
  if (methods.some((m) => m.type === "cod")) options.push({ name: "Cash on delivery", note: "Pay when the order arrives." });
  return { options, moreComing: extras.length === 0 };
}
