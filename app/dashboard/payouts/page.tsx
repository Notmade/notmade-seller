"use client";

import PayoutsView from "../../components/PayoutsView";
import { useDashboardSeller, useSellerCurrency } from "../seller-context";

/** Settlements in the seller's own currency. UAE payouts of India-based sellers are on the UAE sales page. */
export default function PayoutsPage() {
  const seller = useDashboardSeller();
  const { country, currency } = useSellerCurrency();
  const pct = country === "AE" ? seller.uae?.commission_pct : seller.commission?.india_pct;
  const rates = pct != null ? `${country === "AE" ? "UAE" : "India"} ${pct}%` : "";
  return <PayoutsView currency={currency} title="Payouts" rates={rates} />;
}
