"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, fmtDate, isNotLive, type Order } from "../../../../lib/seller-api";
import { useDashboardSeller } from "../../../seller-context";
import { Alert, Button, PageSkeleton } from "../../../../components/portal-ui";

const isCod = (o: Order) => String(o.payment_method || "").toLowerCase() === "cod";

/** One printable page per order. No prices: this goes in the parcel. */
export default function PackingSlipPage() {
  const seller = useDashboardSeller();
  const { ref } = useParams<{ ref: string }>();
  const refNo = decodeURIComponent(ref);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.order(refNo).then((r) => setOrder(r.order)).catch(async (err) => {
      // Older backend: the order is still in the list
      if (isNotLive(err)) {
        const list = await api.orders().catch(() => null);
        const found = list?.orders.find((o) => o.ref_no === refNo);
        if (found) { setOrder(found); return; }
      }
      setError(err instanceof Error ? err.message : "Could not load this order");
    });
  }, [refNo]);

  if (error) return <Alert>{error}</Alert>;
  if (!order) return <PageSkeleton stats={0} rows={3} />;

  return (
    <div>
      <div className="sp-noprint sp-slip-bar">
        <Link href={`/dashboard/orders?ref=${encodeURIComponent(refNo)}`} className="sp-link">Back to order</Link>
        <Button onClick={() => window.print()}>Print packing slip</Button>
      </div>
      <article className="sp-slip">
        <header>
          <div><strong>NOT<b>MADE</b></strong><p>Packing slip</p></div>
          <div><p className="sp-slip-ref">{order.ref_no}</p><p>{fmtDate(order.created_at)}</p></div>
        </header>
        <div className="sp-slip-cols">
          <section><h2>Ship to</h2><p>{order.customer_name || "Customer"}</p><p>{[order.city, order.pincode].filter(Boolean).join(" ")}</p></section>
          <section><h2>From</h2><p>{seller.brand_name || seller.business_name}</p><p>{[seller.address_line, seller.city].filter(Boolean).join(", ")}</p></section>
          <section><h2>Payment</h2><p>{isCod(order) ? "Cash on delivery" : "Prepaid"}</p>{order.waybill && <p>{order.courier || "AWB"} {order.waybill}</p>}</section>
        </div>
        <table>
          <thead><tr><th scope="col">Item</th><th scope="col">Variant</th><th scope="col">Qty</th><th scope="col" aria-label="Packed" /></tr></thead>
          <tbody>
            {order.items.map((i, n) => (
              <tr key={n}><td>{i.product_name}</td><td>{i.label || i.size || "—"}</td><td>{i.quantity}</td><td><span className="sp-slip-box" aria-hidden /></td></tr>
            ))}
          </tbody>
        </table>
        <p className="sp-slip-foot">{order.items.reduce((n, i) => n + i.quantity, 0)} item(s). Tags on, invoice inside.</p>
      </article>
    </div>
  );
}
