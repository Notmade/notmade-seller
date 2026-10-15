"use client";

import { useEffect, useRef, useState } from "react";
import { api, type CommissionRates } from "../../lib/seller-api";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Adds .in to every .lr element inside `root` as it scrolls into view. Re-runs when `dep` changes. */
export function useReveal(root: React.RefObject<HTMLElement>, dep: unknown) {
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".lr:not(.in)") ?? [];
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root, dep]);
}

/** True once the element has been on screen. */
export function useInView<T extends HTMLElement>(threshold = 0.3): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

/** Live rates from GET /seller/commission-rates. Never falls back to a hardcoded number. */
export function useRates() {
  const [rates, setRates] = useState<CommissionRates | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    // A hung request shows the "rate is in your agreement" fallback instead of a skeleton forever
    const timer = window.setTimeout(() => live && setFailed(true), 12000);
    api.commissionRates()
      .then((r) => { if (live) { window.clearTimeout(timer); setFailed(false); setRates(r); } })
      .catch(() => live && setFailed(true));
    return () => { live = false; window.clearTimeout(timer); };
  }, []);
  return { rates, failed };
}

/** Section id currently under the sticky nav. */
export function useActiveSection(ids: string[], dep: unknown) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(ids.includes(e.target.id) ? e.target.id : null); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    // Hero and closing CTA clear the highlight
    ["top", ...ids, "start"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids, dep]);
  return active;
}
