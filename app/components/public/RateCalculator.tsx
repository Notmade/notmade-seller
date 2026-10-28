"use client";

import { useRef } from "react";
import { Calculator } from "../landing/parts";
import { useRates, useReveal } from "../landing/hooks";
import type { ModeContent } from "@/app/landing/content/types";

/** The landing's commission calculator (live rate with configured fallback) for content pages. */
export default function RateCalculator({ calc }: { calc: ModeContent["money"]["calc"] }) {
  const rates = useRates();
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, null);
  return <div ref={ref}><Calculator calc={calc} rates={rates} /></div>;
}
