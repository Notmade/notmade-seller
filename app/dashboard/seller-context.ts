"use client";

import { createContext, useContext } from "react";
import type { Seller } from "../lib/seller-api";

export const SellerContext = createContext<Seller | null>(null);

/** The approved seller for the current dashboard page. Only available under /dashboard. */
export function useDashboardSeller(): Seller {
  const seller = useContext(SellerContext);
  if (!seller) throw new Error("useDashboardSeller must be used inside the dashboard layout");
  return seller;
}
