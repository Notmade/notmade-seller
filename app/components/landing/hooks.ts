"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/seller-api";
import { getMarket } from "@/src/config/markets";
import type { RateKey } from "@/app/landing/content/types";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Adds .in to every .nr element inside `root` as it scrolls into view. Re-runs when `dep` changes. */
export function useReveal(root: React.RefObject<HTMLElement>, dep: unknown) {
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".nr:not(.in)") ?? [];
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root, dep]);
}

const RATES_TIMEOUT_MS = 4000;

export type Rates = Record<RateKey, number | null>;
/** `live[k]` is false when that rate came from the configured fallback (API failed, timed out or left it out). */
export type RatesState = { loading: boolean; rates: Rates; live: Record<RateKey, boolean> };

/** Configured fallback when the API is down: same values onboarding uses (markets config). */
const FALLBACK: Rates = { india_pct: getMarket("in").commissionPct, uae_local_pct: getMarket("ae").commissionPct };
const NOT_LIVE = { india_pct: false, uae_local_pct: false };

const validPct = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 100 ? v : null);

/** Live rates from GET /seller/commission-rates, with a 4 s timeout and the configured fallback. */
export function useRates(): RatesState {
  const [state, setState] = useState<RatesState>({ loading: true, rates: { india_pct: null, uae_local_pct: null }, live: NOT_LIVE });
  useEffect(() => {
    let done = false;
    const fallback = () => { if (!done) { done = true; setState({ loading: false, rates: FALLBACK, live: NOT_LIVE }); } };
    const timer = window.setTimeout(fallback, RATES_TIMEOUT_MS);
    api.commissionRates()
      .then((r) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        const india = validPct(r?.india_pct);
        const uae = validPct(r?.uae_local_pct);
        setState({
          loading: false,
          rates: { india_pct: india ?? FALLBACK.india_pct, uae_local_pct: uae ?? FALLBACK.uae_local_pct },
          live: { india_pct: india != null, uae_local_pct: uae != null },
        });
      })
      .catch(fallback);
    return () => { done = true; window.clearTimeout(timer); };
  }, []);
  return state;
}
