"use client";

import PayoutsView from "../../components/PayoutsView";
import { rateCardLines } from "../../lib/rate-card";
import { useDashboardSeller, useSellerCurrency } from "../seller-context";

/** Settlements in the seller's own currency. */
export default function PayoutsPage() {
  const seller = useDashboardSeller();
  const { country, currency } = useSellerCurrency();
  // The seller's own card, and a single figure only for an India seller without one
  const lines = rateCardLines(seller.rate_card);
  const pct = country === "IN" ? seller.commission?.india_pct : null;
  const rates = lines.length ? lines.join(" · ") : pct != null ? `${pct}%` : "";
  return <PayoutsView currency={currency} title="Payouts" rates={rates} />;
}
