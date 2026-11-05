"use client";

import OrdersView from "../../components/OrdersView";
import { useSellerCurrency } from "../seller-context";

export default function OrdersPage() {
  const { currency } = useSellerCurrency();
  return <OrdersView currency={currency} title="Orders" sub="Accept, pack and hand over. Updates arrive here live." />;
}
