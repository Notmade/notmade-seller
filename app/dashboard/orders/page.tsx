"use client";

import Link from "next/link";
import OrdersView from "../../components/OrdersView";
import { Alert, RED } from "../../components/portal-ui";
import { useSellerCurrency } from "../seller-context";

/** The seller's own market: India orders for India-based sellers, UAE orders for UAE-based sellers. */
export default function OrdersPage() {
  const { currency, uaeApproved } = useSellerCurrency();
  return (
    <OrdersView currency={currency} title="Orders"
      sub="Accept, pack and hand over. NOTMADE generates the AWB once you mark an order ready."
      otherMarketNote={uaeApproved ? (n) => (
        <Alert kind="info">
          You have {n} UAE order{n === 1 ? "" : "s"}.{" "}
          <Link href="/dashboard/uae#orders" style={{ color: RED, fontWeight: 700 }}>Open UAE sales →</Link>
        </Alert>
      ) : undefined} />
  );
}
