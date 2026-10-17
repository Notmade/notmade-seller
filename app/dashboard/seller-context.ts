"use client";

import { createContext, useContext } from "react";
import type { Seller } from "../lib/seller-api";
import { formatMoney, formatMoneyIn, isUaeApproved, sellerCountry, sellerCurrency, type Money } from "../lib/currency";

export const SellerContext = createContext<Seller | null>(null);
/** Re-fetches the seller (GET /seller/me), e.g. after signing an updated agreement. */
export const SellerReloadContext = createContext<() => Promise<void>>(async () => {});

/** The approved seller for the current dashboard page. Only available under /dashboard. */
export function useDashboardSeller(): Seller {
  const seller = useContext(SellerContext);
  if (!seller) throw new Error("useDashboardSeller must be used inside the dashboard layout");
  return seller;
}

export function useReloadSeller(): () => Promise<void> {
  return useContext(SellerReloadContext);
}

/** The signed-in seller's country, currency and formatters (see app/lib/currency.ts). */
export function useSellerCurrency() {
  const seller = useDashboardSeller();
  const currency = sellerCurrency(seller);
  return {
    country: sellerCountry(seller),
    currency,
    uaeApproved: isUaeApproved(seller),
    /** One amount in the seller's currency. */
    fmt: (n: number | null | undefined) => formatMoney(n, currency),
    /** The seller's-currency part of a per-currency bag. */
    fmtBag: (m: Money | null | undefined) => formatMoneyIn(m, currency),
  };
}
