"use client";

import PayoutsView from "../../components/PayoutsView";
import { useDashboardSeller, useSellerCurrency } from "../seller-context";

/** Settlements in the seller's own currency. */
export default function PayoutsPage() {
  const seller = useDashboardSeller();
  const { country, currency } = useSellerCurrency();
  // UAE commission follows the rate card, so a single figure only makes sense in India
  const pct = country === "IN" ? seller.commission?.india_pct : null;
  const rates = pct != null ? `${pct}%` : "";
  return <PayoutsView currency={currency} title="Payouts" rates={rates} />;
}
